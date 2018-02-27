from json import JSONEncoder

import numpy as np
from io import BytesIO

from PIL import Image
from pydicom import Dataset, Sequence
from pydicom.dataelem import PersonName
from pydicom.multival import MultiValue
from pydicom.valuerep import DA, DT, TM, DSfloat, DSdecimal, IS


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
    return file.getvalue()
