from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer

from apps.core.models import *


class PatientSerializer(ModelSerializer):
    modalities = SerializerMethodField()
    images_count = SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('id', 'patient_id', 'patient_name', 'patient_sex', 'patient_age', 'patient_birthdate', 'modalities',
                  'images_count')

    def get_modalities(self, patient: Patient):
        return list([series['modality'] for series in
                     Series.objects.filter(study__patient_id=patient.id).values('modality').distinct()])

    def get_images_count(self, patient: Patient):
        return Instance.objects.filter(series__study__patient_id=patient.id).count()


class StudySerializer(ModelSerializer):
    patient = PatientSerializer()

    class Meta:
        model = Study
        fields = ('id', 'study_id', 'study_instance_uid', 'study_description', 'patient')


class SeriesSerializer(ModelSerializer):
    study = StudySerializer()

    class Meta:
        model = Series
        fields = (
            'id', 'series_instance_uid', 'series_number', 'modality',
            'patient_position', 'body_part_examined', 'study'
        )


class InstanceSerializer(ModelSerializer):
    class Meta:
        model = Instance
        fields = (
            'id', 'sop_instance_uid', 'rows', 'columns', 'smallest_image_pixel_value', 'largest_image_pixel_value',
            'color_space', 'pixel_aspect_ratio', 'pixel_spacing', 'photometric_interpretation', 'image'
        )
