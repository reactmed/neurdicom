import json
from json import JSONEncoder

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


class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
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
        return json.dumps(tags, cls=DicomJsonEncoder)

    def destroy(self):
        print('Destroy method called')
