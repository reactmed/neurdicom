from pydicom import read_file
from tornado import gen

from apps.core.handlers import *
from apps.core.models import *
from apps.dicom_ws.serializers import *
from apps.dicom_processing.views import PluginSerializer
import pynetdicom3 as netdicom

ECHO_SUCCESS = 0x0000


class PatientListHandler(ModelListHandler):
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
        return Instance.objects.filter(series_id=self.path_params['series_id']).order_by('instance_number')


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


class DicomNodeListHandler(ModelListCreateHandler):
    queryset = DicomNode.objects.all()
    serializer_class = DicomNodeSerializer


class DicomNodeDetailHandler(ModelDetailHandler):
    queryset = DicomNode.objects.all()
    serializer_class = DicomNodeSerializer


class DicomNodeEchoHandler(BaseJsonHandler):
    expected_path_params = ['dicom_node_id']

    def get(self, *args, **kwargs):
        dicom_node_id = self.path_params['dicom_node_id']
        dicom_node = DicomNode.objects.get(pk=dicom_node_id)
        ae = netdicom.AE(ae_title=dicom_node.aet_title, scu_sop_class=['1.2.840.10008.1.1'])
        assoc = ae.associate(dicom_node.peer_host, dicom_node.peer_port, ae_title=dicom_node.peer_aet_title)
        if assoc.is_established:
            status = assoc.send_c_echo()
            if status.Status == ECHO_SUCCESS:
                self.set_status(200)
                self.finish()
                return
        self.send_error(500, message='Echo failed')


class PluginListHandler(ModelListCreateHandler):
    queryset = Plugin.objects.all()
    serializer_class = PluginSerializer


class PluginDetailHandler(ModelDetailHandler):
    queryset = Plugin.objects.all()
    serializer_class = PluginSerializer
