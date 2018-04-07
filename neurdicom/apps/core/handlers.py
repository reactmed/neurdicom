import json
import logging

from django.core.exceptions import ObjectDoesNotExist
from pydicom import Dataset, Sequence
from pydicom.multival import MultiValue
from tornado.web import RequestHandler

from apps.core.utils import DicomJsonEncoder, convert_dicom_to_img

# FORMAT = '%(asctime)-15s => %(message)s'
# logging.basicConfig(format=FORMAT)
logger = logging.getLogger()


def exception_render_func(exception_type):
    """
    Set exception type that is handled by render function
    :param exception_type: type of rendered exception
    :return: decorated render function with check if this function can handle exception
    """

    def real_decorator(f):
        def can_handle_exception(exception):
            return isinstance(exception, exception_type)

        def exception_render(self: RequestHandler, e: BaseException):
            return f(self, e)

        exception_render.can_handle_exception = can_handle_exception
        return exception_render

    return real_decorator


@exception_render_func(BaseException)
def default_exception_render(self: RequestHandler, e: BaseException):
    """
    Render for BaseException
    :param self: request handler object
    :param e: exception object
    """
    self.set_status(500)
    self.set_header('Content-Type', 'application/json')
    RequestHandler.write(self, json.dumps({'message': e.__dict__}))
    self.finish()


@exception_render_func(ObjectDoesNotExist)
def object_does_not_exist_render(self: RequestHandler, e: ObjectDoesNotExist):
    """
    Render ObjectDoesNotExist
    """
    self.set_status(404)
    self.set_header('Content-Type', 'application/json')
    RequestHandler.write(self, json.dumps({'message': 'Object not found'}))
    self.finish()


# TODO: if exception_renders is empty real_decorator takes two positional params
# TODO: then raise exception
# TODO: be careful with catching default exceptions
# TODO: test this decorator
def render_exception(exception_renders=(default_exception_render,)):
    def real_decorator(f):

        def wrap(self: RequestHandler, *args, **kwargs):
            try:
                return f(self, *args, **kwargs)
            except BaseException as e:
                if exception_renders:
                    renders = iter(exception_renders)
                    render = next(renders)
                    while render:
                        if render.can_handle_exception(e):
                            return render(self, e)
                        render = next(renders)
                else:
                    return default_exception_render(self, e)

        return wrap

    return real_decorator


class BaseNeurDicomHandler(RequestHandler):
    """ Basic HTTP handler
    Supports CORS requests, adds default headers and
    parse path segments into dictionary, in which all
    pairs of keys and values are considered as pair of named segment in path and
    path segment value

    To use naming path segments in child classed
    initialize field 'expected_path_params' with ordered list of named
    which are mapped to path segments in url regex, ex:

    1. Create tornado web application and pass to constructor
    tuple with regex URL and class of inherited handler

    app = tornado.web.Application(
        [
            (r'/api/patients/(\d+)/studies', PatientStudiesHandler),
        ]

    2. In `PatientStudiesHandler` initialize field `PatientStudiesHandler.expected_path_params`
    in which first value is name of first group in regex URL r'/api/patients/(\d+)/studies'

    class PatientStudiesHandler(BaseNeurDicomHandler):
        expected_path_params = ['patient_id']

    3. We can use path_params

    class PatientStudiesHandler(BaseNeurDicomHandler):
        expected_path_params = ['patient_id']

        @gen.coroutine
        def get(self, *args, **kwargs):
            patient_id = self.request.path_params['patient_id']
            self.set_header('Content-Type', 'application/json')
            yield self.write(json.dumps({'patient_id': patient_id}))

    """

    def set_default_headers(self):
        """
        Set CORS support headers
        """
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self, *args, **kwargs):
        self.set_status(204)
        self.finish()

    def data_received(self, chunk):
        logger.info('Data received:', chunk)

    expected_path_params = None
    path_params = None

    def prepare(self):
        """
        Add path_params to self object
        Maps path segments from path_args to named ordered list of path segment values
        """
        if self.expected_path_params and self.path_args:
            if len(self.expected_path_params) == len(self.path_args):
                self.path_params = {
                    self.expected_path_params[i]: self.path_args[i] for i in range(len(self.expected_path_params))
                }


class BaseJsonHandler(BaseNeurDicomHandler):
    """
    Serialize result as JSON
    """

    def prepare(self):
        super(BaseJsonHandler, self).prepare()
        if self.request.body:
            try:
                json_data = json.loads(self.request.body)
                self.request.arguments.update(json_data)
            except ValueError:
                self.send_error(400, message='Body is not JSON deserializable')

    def set_default_headers(self):
        super(BaseJsonHandler, self).set_default_headers()
        self.set_header('Content-Type', 'application/json')
        self.set_header('Server', 'NeurDICOM')

    def write(self, chunk):
        try:
            json_data = json.dumps(chunk)
            super(BaseJsonHandler, self).write(json_data)
        except ValueError:
            self.send_error(500, message='Response data is not JSON serializable')


class BaseDicomJsonHandler(BaseNeurDicomHandler):
    """
    Extract tags from DICOM file and serialize them into JSON
    """

    def prepare(self):
        if self.request.body:
            try:
                json_data = json.loads(self.request.body)
                self.request.arguments.update(json_data)
            except ValueError:
                self.send_error(400, message='Body is not JSON deserializable')

    def set_default_headers(self):
        super(BaseDicomJsonHandler, self).set_default_headers()
        self.set_header('Content-Type', 'application/json')
        self.set_header('Server', 'NeurDICOM')

    def write(self, chunk):
        if isinstance(chunk, Dataset):
            ds: Dataset = chunk
            tags = {}
            for tag_key in ds.dir():
                tag = ds.data_element(tag_key)
                if tag_key == 'PixelData':
                    continue
                if not hasattr(tag, 'name') or not hasattr(tag, 'value'):
                    continue
                tag_value = tag.value
                # Delete in future
                if isinstance(tag_value, Sequence) or isinstance(tag_value, MultiValue) or isinstance(tag_value, dict):
                    continue
                tags[tag.name] = tag_value
            try:
                response_json = json.dumps(tags, cls=DicomJsonEncoder)
                super(BaseDicomJsonHandler, self).write(response_json)
            except ValueError:
                self.send_error(500, message='DICOM is not JSON serializable')
        else:
            super(BaseDicomJsonHandler, self).write(chunk)


class BaseBytesHandler(BaseNeurDicomHandler):
    def set_default_headers(self):
        super(BaseNeurDicomHandler, self).set_default_headers()
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Server', 'NeurDICOM')


class BaseDicomImageHandler(BaseNeurDicomHandler):
    """
    Extract image from DICOM, convert to usual image format and write as response
    """

    def set_default_headers(self):
        super(BaseDicomImageHandler, self).set_default_headers()
        self.set_header('Content-Type', 'image/jpeg')
        self.set_header('Server', 'NeurDICOM')

    def write(self, chunk):
        if isinstance(chunk, Dataset):
            s = convert_dicom_to_img(chunk)
            self.set_header('Content-Length', len(s))
            super(BaseDicomImageHandler, self).write(s)
        else:
            super(BaseDicomImageHandler, self).write(chunk)


class ListHandlerMixin(BaseJsonHandler):
    """
    Retrieve list of objects from database and serialize them into JSON
    """
    queryset = None
    serializer_class = None

    # @render_exception(exception_renders=(default_exception_render,))
    def get(self, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
        serializer = self.serializer_class(self.queryset.all(), many=True)
        self.write(serializer.data)


class CreateHandlerMixin(BaseJsonHandler):
    """
    Parse JSON body and create a model instance from parsed arguments
    """
    serializer_class = None

    # @render_exception(exception_renders=(default_exception_render,))
    def post(self, *args, **kwargs):
        serializer = self.serializer_class(data=self.request.arguments)
        if serializer.is_valid():
            serializer.save()
            self.write(serializer.data)
        else:
            self.write(serializer.errors)
            self.send_error(500)


class RetrieveHandlerMixin(BaseJsonHandler):
    """
    Find a model instance by specified primary key
    """
    queryset = None
    serializer_class = None

    # @render_exception(exception_renders=(object_does_not_exist_render,))
    def get(self, instance_id, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
        serializer = self.serializer_class(self.queryset.get(pk=instance_id))
        self.write(serializer.data)


class UpdateHandlerMixin(BaseJsonHandler):
    """
    Update a model instance by specified primary key
    """
    queryset = None
    serializer_class = None

    # @render_exception(exception_renders=(default_exception_render,))
    def put(self, instance_id, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
            return
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
            return
        update_arguments = self.request.arguments
        model_instance = self.queryset.get(pk=instance_id)
        serializer = self.serializer_class(model_instance, data=update_arguments)
        if serializer.is_valid():
            serializer.save()
            self.write(serializer.data)
        else:
            self.write(serializer.errors)


class DestroyHandlerMixin(BaseJsonHandler):
    """
    Delete a model instance from database by specified id
    """
    queryset = None

    # @render_exception(exception_renders=(object_does_not_exist_render,))
    def delete(self, instance_id, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        self.queryset.get(pk=instance_id).delete()


class ListHandler(ListHandlerMixin):
    pass


class ListCreateHandler(ListHandlerMixin, CreateHandlerMixin):
    pass


class RetrieveHandler(RetrieveHandlerMixin):
    pass


class RetrieveDestroyHandler(RetrieveHandlerMixin, DestroyHandlerMixin):
    pass


class RetrieveUpdateHandler(RetrieveHandlerMixin, UpdateHandlerMixin):
    pass


class RetrieveUpdateDestroyHandler(
    RetrieveHandlerMixin,
    UpdateHandlerMixin,
    DestroyHandlerMixin
):
    pass
