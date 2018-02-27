import json

from pydicom import Dataset
from tornado.web import RequestHandler

from utils import DicomJsonEncoder


class BaseDicomJsonHandler(RequestHandler):
    def prepare(self):
        if self.request.body:
            try:
                json_data = json.loads(self.request.body)
                self.request.arguments.update(json_data)
            except ValueError:
                self.send_error(400, message='Body is not JSON deserializable')

    def set_default_headers(self):
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
                tags[tag.name] = tag_value
            try:
                response_json = json.dumps(tags, cls=DicomJsonEncoder)
                super(BaseDicomJsonHandler, self).write(response_json)
            except ValueError:
                self.send_error(500, message='DICOM is not JSON serializable')
        else:
            super(BaseDicomJsonHandler, self).write(chunk)
