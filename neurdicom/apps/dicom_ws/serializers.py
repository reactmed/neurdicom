from rest_framework.serializers import ModelSerializer

from apps.core.models import *


class PatientSerializer(ModelSerializer):
    class Meta:
        model = Patient
        fields = ('id', 'patient_id', 'patient_name', 'patient_sex', 'patient_age', 'patient_birthdate')


class StudySerializer(ModelSerializer):
    class Meta:
        model = Study
        fields = ('id', 'study_id', 'study_instance_uid', 'study_description')


class SeriesSerializer(ModelSerializer):
    class Meta:
        model = Series
        fields = ('id', 'series_instance_uid', 'series_number', 'modality', 'patient_position', 'body_part_examined')


class InstanceSerializer(ModelSerializer):
    class Meta:
        model = Instance
        fields = (
            'id', 'sop_instance_uid', 'rows', 'columns', 'smallest_image_pixel_value', 'largest_image_pixel_value',
            'color_space', 'pixel_aspect_ratio', 'pixel_spacing', 'photometric_interpretation', 'image'
        )
