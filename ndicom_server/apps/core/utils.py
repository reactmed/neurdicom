import json
from abc import abstractmethod
from io import BytesIO
from json import JSONEncoder
from urllib.request import urlopen
from zipfile import ZipFile

import numpy as np
import pip
from PIL import Image
from pydicom import Sequence
from pydicom import read_file
from pydicom.dataelem import PersonName
from pydicom.multival import MultiValue
from pydicom.valuerep import DA, DT, TM, DSfloat, DSdecimal, IS
from tornado.web import RequestHandler

from apps.core.models import *
import neurdicom.settings as settings


class DicomSaver:

    @classmethod
    def save(cls, img):
        if isinstance(img, Dataset):
            ds: Dataset = img
            img = BytesIO()
            img.seek(0)
            ds.save_as(img)
        else:
            ds: Dataset = read_file(img)
        if isinstance(img, str):
            img = open(img, 'rb')
        if Instance.objects.filter(sop_instance_uid=ds.SOPInstanceUID).exists():
            instance = Instance.objects.get(sop_instance_uid=ds.SOPInstanceUID)
            instance.image.delete()
            instance.image.save('', img)
            return instance
        elif Series.objects.filter(series_instance_uid=ds.SeriesInstanceUID).exists():
            series = Series.objects.get(series_instance_uid=ds.SeriesInstanceUID)
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', img)
            instance.save()
            img.close()
            return instance
        elif Study.objects.filter(study_instance_uid=ds.StudyInstanceUID).exists():
            study = Study.objects.get(study_instance_uid=ds.StudyInstanceUID)
            series = Series.from_dataset(ds=ds)
            series.study = study
            series.save()
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', img)
            instance.save()
            img.close()
            return instance

        if ds.PatientID is None or ds.PatientID == '':
            patient = Patient.from_dataset(ds=ds)
            patient.save()
            study = Study.from_dataset(ds=ds)
            study.patient = patient
            study.save()
            series = Series.from_dataset(ds=ds)
            series.study = study
            series.save()
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', img)
            instance.save()
            img.close()
            return instance
        elif Patient.objects.filter(patient_id=ds.PatientID):
            patient = Patient.objects.get(patient_id=ds.PatientID)
            study = Study.from_dataset(ds=ds)
            study.patient = patient
            study.save()
            series = Series.from_dataset(ds=ds)
            series.study = study
            series.save()
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', img)
            instance.save()
            img.close()
            return instance
        else:
            patient = Patient.from_dataset(ds=ds)
            patient.save()
            study = Study.from_dataset(ds=ds)
            study.patient = patient
            study.save()
            series = Series.from_dataset(ds=ds)
            series.study = study
            series.save()
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', img)
            instance.save()
            img.close()
            return instance


class BaseProcessor:

    @abstractmethod
    def process(self, img, **params):
        pass


# c_float_p = POINTER(c_float)
# c_int_p = POINTER(c_int)
#
#
# class NativeImageProcessor(BaseProcessor):
#     def __init__(self, plugin: Plugin):
#         self.lib = cdll.LoadLibrary(path)
#         self.lib.Process.argtypes = [c_void_p, c_float_p, c_int, c_int, POINTER(c_char)]
#         self.lib.Process.restype = c_int_p
#         self.lib.DestroyPlugin.argtypes = [c_void_p]
#
#     def __enter__(self):
#         self.obj = self.lib.InitPlugin()
#         return self
#
#     def process(self, a: np.ndarray, **kwargs):
#         w = a.shape[2]
#         h = a.shape[1]
#         params = create_string_buffer(str.encode(dumps(kwargs)))
#         img = a.ctypes.data_as(c_float_p)
#         cres = self.lib.Process(self.obj, img, w, h, params)
#         return np.ctypeslib.as_array(cres, shape=(h, w))
#
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         self.lib.DestroyPlugin(self.obj)
#         return self
#
#
# class NativeSeriesProcessor(BaseProcessor):
#     def __init__(self, path):
#         self.lib = cdll.LoadLibrary(path)
#         self.lib.Process.argtypes = [c_void_p, c_float_p, c_int_p, c_int, POINTER(c_char)]
#         self.lib.Process.restype = c_int_p
#
#     def __enter__(self):
#         self.obj = self.lib.InitPlugin()
#         return self
#
#     def process(self, a: np.ndarray, **kwargs):
#         images_count = 1
#         if a.ndim == 2:
#             w = a.shape[1]
#             h = a.shape[0]
#             IntArray = c_int * 2
#             images_size = IntArray(w, h)
#         else:
#             images_count = a.shape[0]
#             w = a.shape[2]
#             h = a.shape[1]
#             IntArray = c_int * (images_count * 2)
#             images_size = IntArray(*list([w, h] * images_count))
#         params = create_string_buffer(str.encode(dumps(kwargs)))
#         img = a.ctypes.data_as(c_float_p)
#         cres = self.lib.Process(self.obj, img, images_size, images_count, params)
#         if images_count == 1:
#             return np.ctypeslib.as_array(cres, shape=(h, w))
#         else:
#             return np.ctypeslib.as_array(cres, shape=(images_count, h, w))
#
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         self.lib.DestroyPlugin(self.obj)
#         return self


class ImageProcessor(BaseProcessor):

    def __init__(self, plugin: Plugin):
        self.processor = __import__(plugin.name).Plugin()

    def __enter__(self):
        if hasattr(self.processor, "__enter__"):
            self.processor.__enter__()
        return self

    def process(self, instance: Instance, **params):
        ds = read_file(instance.image).pixel_array
        result = self.processor.process(ds, **params)
        return result

    def __exit__(self, exc_type, exc_val, exc_tb):
        if hasattr(self.processor, "__exit__"):
            self.processor.__exit__(exc_type, exc_val, exc_tb)
        return self


class PluginSaver:

    @staticmethod
    def save(plugin: Plugin = None, fp=None, is_native=False):
        if plugin is None:
            plugin = Plugin()
        if isinstance(fp, str):
            fp = open(fp, 'rb')
        with ZipFile(fp) as plugin_archive:
            archive_name = plugin_archive.filelist[0].filename
            meta = plugin_archive.read(os.path.join(archive_name, 'META.json'))
            plugin_meta = json.loads(meta)
            plugin.name = plugin_meta['name']
            plugin.author = plugin_meta['author']
            plugin.version = plugin_meta['version']
            plugin.info = plugin_meta['info']
            plugin.docs = plugin_meta['docs']
            plugin.params = plugin_meta.get('params', None)
            plugin.result = plugin_meta['result']
            plugin.tags = plugin_meta.get('tags', None)
            plugin.modalities = plugin_meta.get('modalities', None)
            plugin.is_native = is_native
            plugin.plugin.save('', fp)
            plugin.save()
        return plugin


class DicomJsonEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, PersonName):
            return obj.original_string
        if isinstance(obj, MultiValue) or isinstance(obj, Sequence):
            return_list = []
            for value in obj:
                return_list.append(self.default(value))
            return return_list
        if isinstance(obj, DA):
            return '%d-%02d-%02d' % (obj.year, obj.month, obj.day)
        if isinstance(obj, DT):
            return '%d-%02d-%02d %02d:%02d:%02d' % (obj.year, obj.month, obj.day, obj.hour, obj.minute, obj.second)
        if isinstance(obj, TM):
            return '%02d:%02d:%02d' % (obj.hour, obj.minute, obj.second)
        if isinstance(obj, DSfloat):
            return str(obj)
        if isinstance(obj, DSdecimal):
            return str(obj)
        if isinstance(obj, IS):
            return obj.original_string or str(obj)
        if isinstance(obj, Dataset):
            child_tags = obj.dir()
            return_dict = {}
            for tag in child_tags:
                return_dict[tag] = self.default(obj.data_element(tag).value)
            return return_dict
        return str(obj)


def convert_dicom_to_img(ds: Dataset, img_format='jpeg'):
    return convert_array_to_img(ds.pixel_array, img_format=img_format)


def convert_array_to_img(pixel_array: np.ndarray, img_format='jpeg'):
    img = convert_to_8bit(pixel_array)
    img = Image.fromarray(img)
    file = BytesIO()
    img.save(file, format=img_format)
    file.seek(0)
    return file.read()


def convert_to_8bit(pixel_array: np.ndarray):
    orig_shape = pixel_array.shape
    flatten_img = pixel_array.reshape((-1))
    img_min = min(flatten_img)
    img_max = max(flatten_img)
    flatten_img = np.floor_divide(flatten_img, (img_max - img_min + 1) / 256, casting='unsafe')
    img = flatten_img.astype(dtype=np.uint8).reshape(orig_shape)
    return img


def required_auth(methods):
    if methods is None:
        raise ValueError('Specify auth HTTP methods')

    def proxy_cls(orig_cls):
        if not settings.REQUIRE_AUTH:
            return orig_cls

        orig_get = orig_cls.get
        orig_post = orig_cls.post
        orig_put = orig_cls.put
        orig_delete = orig_cls.delete

        def _auth(self, method_name):
            auth_token = self.get_secure_cookie('neurdicom.auth')
            if auth_token is None:
                self.clear()
                self.set_status(401)
                return False
            auth_token = auth_token.decode('utf-8')
            parts = auth_token.split('|')
            user_id = int(parts[0])
            email = parts[1]
            if method_name in methods and not User.objects.filter(pk=user_id, email=email).exists():
                self.clear()
                self.set_status(401)
                return False
            return True

        def get(self, *args, **kwargs):
            if self._auth('GET'):
                return orig_get(self, *args, **kwargs)

        def post(self, *args, **kwargs):
            if self._auth('POST'):
                return orig_post(self, *args, **kwargs)

        def put(self, *args, **kwargs):
            if self._auth('PUT'):
                return orig_put(self, *args, **kwargs)

        def delete(self, *args, **kwargs):
            if self._auth('DELETE'):
                return orig_delete(self, *args, **kwargs)

        orig_cls._auth = _auth
        orig_cls.get = get
        orig_cls.post = post
        orig_cls.put = put
        orig_cls.delete = delete
        return orig_cls

    return proxy_cls


def required_admin(methods):
    if methods is None:
        raise ValueError('Specify auth HTTP methods')

    def proxy_cls(orig_cls):
        if not settings.REQUIRE_AUTH:
            return orig_cls

        orig_get = orig_cls.get
        orig_post = orig_cls.post
        orig_put = orig_cls.put
        orig_delete = orig_cls.delete

        def _auth(self, method_name):
            auth_token = self.get_secure_cookie('neurdicom.auth')
            if auth_token is None:
                self.clear()
                self.set_status(401)
                return False
            auth_token = auth_token.decode('utf-8')
            parts = auth_token.split('|')
            user_id = int(parts[0])
            email = parts[1]
            if method_name in methods and not User.objects.filter(pk=user_id, email=email, is_staff=True).exists():
                self.clear()
                self.set_status(403)
                return False
            return True

        def get(self, *args, **kwargs):
            if self._auth('GET'):
                return orig_get(self, *args, **kwargs)

        def post(self, *args, **kwargs):
            if self._auth('POST'):
                return orig_post(self, *args, **kwargs)

        def put(self, *args, **kwargs):
            if self._auth('PUT'):
                return orig_put(self, *args, **kwargs)

        def delete(self, *args, **kwargs):
            if self._auth('DELETE'):
                return orig_delete(self, *args, **kwargs)

        orig_cls._auth = _auth
        orig_cls.get = get
        orig_cls.post = post
        orig_cls.put = put
        orig_cls.delete = delete

        return orig_cls

    return proxy_cls


def render_exception(orig_cls):
    orig_get = orig_cls.get
    orig_post = orig_cls.post
    orig_put = orig_cls.put
    orig_delete = orig_cls.delete

    def get(self, *args, **kwargs):
        try:
            return orig_get(self, *args, **kwargs)
        except Exception as e:
            RequestHandler.set_status(self, 500)
            RequestHandler.set_header(self, 'Content-Type', 'application/json')
            RequestHandler.set_header(self, 'Server', 'NeurDICOM')
            RequestHandler.write(self, json.dumps({
                'message': str(e)
            }))
            RequestHandler.finish(self)

    def post(self, *args, **kwargs):
        try:
            return orig_post(self, *args, **kwargs)
        except Exception as e:
            RequestHandler.set_status(self, 500)
            RequestHandler.set_header(self, 'Content-Type', 'application/json')
            RequestHandler.set_header(self, 'Server', 'NeurDICOM')
            RequestHandler.write(self, json.dumps({
                'message': str(e)
            }))
            RequestHandler.finish(self)

    def put(self, *args, **kwargs):
        try:
            return orig_put(self, *args, **kwargs)
        except Exception as e:
            RequestHandler.set_status(self, 500)
            RequestHandler.set_header(self, 'Content-Type', 'application/json')
            RequestHandler.set_header(self, 'Server', 'NeurDICOM')
            RequestHandler.write(self, json.dumps({
                'message': str(e)
            }))
            RequestHandler.finish(self)

    def delete(self, *args, **kwargs):
        try:
            return orig_delete(self, *args, **kwargs)
        except Exception as e:
            RequestHandler.set_status(self, 500)
            RequestHandler.set_header(self, 'Content-Type', 'application/json')
            RequestHandler.set_header(self, 'Server', 'NeurDICOM')
            RequestHandler.write(self, json.dumps({
                'message': str(e)
            }))
            RequestHandler.finish(self)

    orig_cls.get = get
    orig_cls.post = post
    orig_cls.put = put
    orig_cls.delete = delete
    return orig_cls


def install_from_pypi(plugin_name, upgrade=True):
    with urlopen('https://raw.githubusercontent.com/reactmed/neurdicom-plugins/master/REPO_META.json') as meta_file:
        plugins = json.loads(meta_file.read())['plugins']
        for plugin in plugins:
            if plugin['name'] == plugin_name:
                if upgrade:
                    ret = pip.main(['install', '--upgrade', plugin['name']])
                else:
                    ret = pip.main(['install', plugin['name']])
                if ret > 0:
                    raise ValueError('Плагин %s не найден на сайте pypi.org' % plugin_name)
                meta = plugin['meta']
                plugin_ = Plugin()
                plugin_.author = meta['author']
                plugin_.name = plugin['name']
                plugin_.display_name = meta['display_name']
                plugin_.version = meta.get('version', '1.0')
                plugin_.info = meta.get('info', None)
                plugin_.docs = meta.get('docs', None)
                plugin_.modalities = meta.get('modalities', [])
                plugin_.tags = meta.get('tags', [])
                plugin_.params = meta.get('params', [])
                plugin_.result = meta['result']
                plugin_.is_installed = True
                return plugin_.save()
