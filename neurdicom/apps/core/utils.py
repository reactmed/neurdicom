import importlib
import json
from json import JSONEncoder
from zipfile import ZipFile

import sys

import numpy as np
from PIL import Image
from io import BytesIO
from pydicom import Dataset, Sequence
from pydicom import read_file
from pydicom.dataelem import PersonName
from pydicom.multival import MultiValue
from pydicom.valuerep import DA, DT, TM, DSfloat, DSdecimal, IS

from apps.core.models import *


class DicomSaver:

    @classmethod
    def save(cls, fp):
        ds: Dataset = read_file(fp)
        if isinstance(fp, str):
            fp = open(fp, 'rb')
        if Instance.objects.filter(sop_instance_uid=ds.SOPInstanceUID).exists():
            instance = Instance.objects.get(sop_instance_uid=ds.SOPInstanceUID)
            instance.image.delete()
            instance.image.save('', fp)
            return instance
        elif Series.objects.filter(series_instance_uid=ds.SeriesInstanceUID).exists():
            series = Series.objects.get(series_instance_uid=ds.SeriesInstanceUID)
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', fp)
            instance.save()
            fp.close()
            return instance
        elif Study.objects.filter(study_instance_uid=ds.StudyInstanceUID).exists():
            study = Study.objects.get(study_instance_uid=ds.StudyInstanceUID)
            series = Series.from_dataset(ds=ds)
            series.study = study
            series.save()
            instance = Instance.from_dataset(ds=ds)
            instance.series = series
            instance.image.save('', fp)
            instance.save()
            fp.close()
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
            instance.image.save('', fp)
            instance.save()
            fp.close()
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
            instance.image.save('', fp)
            instance.save()
            fp.close()
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
            instance.image.save('', fp)
            instance.save()
            fp.close()
            return instance


class DicomProcessor:

    @staticmethod
    def process(instance: Instance, plugin: Plugin, **params):
        ds = read_file(instance.image)
        plugin_path = plugin.plugin.path
        sys.path.append(plugin_path)
        importlib.invalidate_caches()
        with ZipFile(plugin.plugin) as zip_file:
            module_name = zip_file.filelist[0].filename
            module_name = module_name.replace('/', '').replace('\\', '')
        plugin_module = importlib.import_module(module_name)
        importlib.reload(plugin_module)
        plugin_processor = plugin_module.Plugin()
        plugin_processor.init()
        result = plugin_processor.process(ds, **params)
        plugin_processor.destroy()
        sys.path.remove(plugin_path)
        return result


class PluginSaver:

    @staticmethod
    def save(plugin: Plugin = None, fp=None):
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
    orig_shape = pixel_array.shape
    flatten_img = pixel_array.reshape((-1))
    img_min = min(flatten_img)
    img_max = max(flatten_img)
    flatten_img = np.floor_divide(flatten_img, (img_max - img_min + 1) / 256, casting='unsafe')
    img = flatten_img.astype(dtype=np.uint8).reshape(orig_shape)
    img = Image.fromarray(img)
    file = BytesIO()
    img.save(file, format=img_format)
    file.seek(0)
    return file.read()
