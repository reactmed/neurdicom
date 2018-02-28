import json

from pydicom import Dataset, Sequence
from pydicom.multival import MultiValue
from tornado.web import RequestHandler

from apps.core.models import Patient, Instance
from apps.core.utils import DicomJsonEncoder, convert_dicom_to_img
from apps.dicom_ws.serializers import PatientSerializer, InstanceSerializer


class BaseNeurDicomHandler(RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self, *args, **kwargs):
        self.set_status(204)
        self.finish()

    def data_received(self, chunk):
        pass

    expected_path_params = None
    path_params = None

    def prepare(self):
        if self.expected_path_params and self.path_args:
            if len(self.expected_path_params) == len(self.path_args):
                self.path_params = {
                    self.expected_path_params[i]: self.path_args[i] for i in range(len(self.expected_path_params))
                }


class BaseJsonHandler(BaseNeurDicomHandler):
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


class ModelListHandler(BaseJsonHandler):
    queryset = None
    serializer_class = None

    def get(self, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
        serializer = self.serializer_class(self.queryset, many=True)
        self.write(serializer.data)


class ModelListCreateHandler(BaseJsonHandler):
    queryset = None
    serializer_class = None

    def get(self, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
        serializer = self.serializer_class(self.queryset, many=True)
        self.write(serializer.data)

    def post(self, *args, **kwargs):
        serializer = self.serializer_class(data=self.request.arguments)
        if serializer.is_valid():
            serializer.save()
            self.write(serializer.data)
        else:
            self.write(serializer.errors)
            self.send_error(500)


class ModelDetailHandler(BaseJsonHandler):
    queryset = None
    serializer_class = None

    def get(self, instance_id, *args, **kwargs):
        if not self.queryset:
            self.send_error(500, message='Model queryset is not defined')
        if not self.serializer_class:
            self.send_error(500, message='Serializer class is not defined')
        serializer = self.serializer_class(self.queryset.get(pk=instance_id))
        self.write(serializer.data)


class BaseDicomJsonHandler(BaseNeurDicomHandler):
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


class BaseDicomImageHandler(BaseNeurDicomHandler):
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

# class BaseMultipleTypeResponseHandler()
