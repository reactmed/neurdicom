import json

from pydicom import Dataset
from tornado.web import RequestHandler

from apps.core.models import Patient, Instance
from apps.core.utils import DicomJsonEncoder
from apps.dicom_ws.serializers import PatientSerializer, InstanceSerializer


class BaseJsonHandler(RequestHandler):
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
        try:
            json_data = json.dumps(chunk)
            super(BaseJsonHandler, self).write(json_data)
        except ValueError:
            self.send_error(500, message='Response data is not JSON serializable')


class PatientHandler(BaseJsonHandler):
    def get(self, *args, **kwargs):
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        self.write(serializer.data)


class InstanceListHandler(BaseJsonHandler):
    def get(self, *args, **kwargs):
        patients = Instance.objects.all()
        serializer = InstanceSerializer(patients, many=True)
        self.write(serializer.data)
