from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [

    # Patient studies
    path('patients/<int:pk>/studies', PatientStudiesAPIView.as_view()),
    # Patients
    path('patients/<int:pk>', PatientDetailAPIView.as_view()),
    path('patients', PatientListAPIView.as_view()),

    # Study series
    path('studies/<int:pk>/series', StudySeriesAPIView.as_view()),
    # Studies
    path('studies/<int:pk>', StudyDetailAPIView.as_view()),
    path('studies', StudyListAPIView.as_view()),

    # Series
    path('series/<int:pk>', SeriesDetailAPIView.as_view()),
    path('series', SeriesListAPIView.as_view()),

    # Instances
    path('instances/<int:pk>/image', get_instance_image),
    path('instances/<int:pk>', InstanceDetailAPIView.as_view()),
    path('instances', InstanceListAPIView.as_view())
]
