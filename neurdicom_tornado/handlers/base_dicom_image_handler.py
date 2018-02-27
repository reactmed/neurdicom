from pydicom import Dataset
from tornado.web import RequestHandler

from utils import convert_dicom_to_img


class BaseDicomImageHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header('Content-Type', 'image/jpeg')
        self.set_header('Server', 'NeurDICOM')

    def write(self, chunk):
        if isinstance(chunk, Dataset):
            s = convert_dicom_to_img(chunk)
            self.set_header('Content-Length', len(s))
            super(BaseDicomImageHandler, self).write(s)
        else:
            super(BaseDicomImageHandler, self).write(chunk)
