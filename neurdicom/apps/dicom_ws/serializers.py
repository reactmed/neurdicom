from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer

from apps.core.models import *


class PatientSerializer(ModelSerializer):
    images_count = SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('id', 'patient_id', 'patient_name', 'patient_sex', 'patient_age', 'patient_birthdate',
                  'images_count')

    def get_images_count(self, patient: Patient):
        return Instance.objects.filter(series__study__patient_id=patient.id).count()


class SeriesSerializer(ModelSerializer):
    images_count = SerializerMethodField()

    class Meta:
        model = Series
        fields = (
            'id', 'series_instance_uid', 'series_number', 'modality',
            'patient_position', 'body_part_examined', 'protocol_name', 'images_count'
        )

    def get_images_count(self, series: Series):
        return Instance.objects.filter(series_id=series.id).count()


class StudySerializer(ModelSerializer):
    patient = PatientSerializer()
    series = SeriesSerializer(many=True, required=False)
    modalities = SerializerMethodField()
    images_count = SerializerMethodField()

    class Meta:
        model = Study
        fields = (
            'id', 'study_id', 'study_instance_uid', 'study_description', 'patient', 'modalities', 'images_count',
            'series'
        )

    def get_modalities(self, study: Study):
        return list([series['modality'] for series in
                     study.series.values('modality').distinct()])

    def get_images_count(self, study: Study):
        return Instance.objects.filter(series__study__id=study.id).count()


class InstanceSerializer(ModelSerializer):
    class Meta:
        model = Instance
        fields = (
            'id', 'sop_instance_uid', 'rows', 'columns', 'smallest_image_pixel_value', 'largest_image_pixel_value',
            'color_space', 'pixel_aspect_ratio', 'pixel_spacing', 'photometric_interpretation', 'image'
        )


class DicomNodeSerializer(ModelSerializer):
    class Meta:
        model = DicomNode
        fields = ('id', 'name', 'aet_title', 'peer_aet_title', 'peer_host', 'peer_port')
