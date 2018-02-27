from pydicom import read_file
from tornado import gen

from apps.core.handlers import *
from apps.core.models import *
from apps.dicom_ws.serializers import *


class PatientListHandler(ModelListCreateHandler):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientDetailHandler(ModelDetailHandler):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientStudiesHandler(ModelListHandler):
    expected_path_params = ['patient_id']
    serializer_class = StudySerializer

    @property
    def queryset(self):
        return Study.objects.filter(patient_id=self.path_params['patient_id'])


class StudyListHandler(ModelListHandler):
    queryset = Study.objects.all()
    serializer_class = StudySerializer


class StudyDetailHandler(ModelDetailHandler):
    queryset = Study.objects.all()
    serializer_class = StudySerializer


class StudySeriesHandler(ModelListHandler):
    expected_path_params = ['study_id']
    serializer_class = SeriesSerializer

    @property
    def queryset(self):
        return Series.objects.filter(study_id=self.path_params['study_id'])


class SeriesListHandler(ModelListHandler):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer


class SeriesDetailHandler(ModelDetailHandler):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer


class SeriesInstancesHandler(ModelListHandler):
    expected_path_params = ['series_id']
    serializer_class = InstanceSerializer

    @property
    def queryset(self):
        return Instance.objects.filter(series_id=self.path_params['series_id'])


class InstanceListHandler(ModelListHandler):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceDetailHandler(ModelDetailHandler):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceTagsHandler(BaseDicomJsonHandler):

    @gen.coroutine
    def get(self, instance_id, *args, **kwargs):
        instance = Instance.objects.get(pk=instance_id)
        ds = read_file(instance.image.path)
        yield self.write(ds)


class InstanceImageHandler(BaseDicomImageHandler):

    @gen.coroutine
    def get(self, instance_id, *args, **kwargs):
        instance = Instance.objects.get(pk=instance_id)
        ds = read_file(instance.image.path)
        yield self.write(ds)
