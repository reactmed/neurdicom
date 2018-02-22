from django.contrib import admin
from .models import *


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_id', 'patient_name', 'patient_sex', 'patient_birthdate')


@admin.register(Study)
class StudyAdmin(admin.ModelAdmin):
    list_display = ('id', 'study_id', 'study_instance_uid', 'study_description')


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'series_instance_uid', 'series_number', 'modality', 'patient_position')
    list_filter = ('modality',)


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'sop_instance_uid', 'rows', 'columns', 'photometric_interpretation', 'image')


@admin.register(Plugin)
class PluginAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'author', 'info', 'plugin')
