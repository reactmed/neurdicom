from io import BytesIO

import numpy as np
import pydicom as dicom
from PIL import Image
from django.http import HttpResponse
from rest_framework import status
from rest_framework.generics import *
from rest_framework.response import Response

from apps.core.utils import DicomSaver
from apps.dicom_ws.serializers import *


class PatientDetailAPIView(RetrieveDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientListAPIView(ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class PatientStudiesAPIView(ListAPIView):
    serializer_class = StudySerializer

    def get_queryset(self):
        patient_id = self.kwargs['pk']
        return Study.objects.filter(patient_id=patient_id)


class StudySeriesAPIView(ListAPIView):
    serializer_class = SeriesSerializer

    def get_queryset(self):
        study_id = self.kwargs['pk']
        return Series.objects.filter(study_id=study_id)


class StudyDetailAPIView(RetrieveDestroyAPIView):
    queryset = Study.objects.all()
    serializer_class = StudySerializer


class StudyListAPIView(ListAPIView):
    queryset = Study.objects.all()
    serializer_class = StudySerializer


class SeriesDetailAPIView(RetrieveDestroyAPIView):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer


class SeriesListAPIView(ListAPIView):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer


class InstanceDetailAPIView(RetrieveDestroyAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer


class InstanceListAPIView(ListCreateAPIView):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer

    def create(self, request, *args, **kwargs):
        instances = []
        for file in request.FILES:
            dicom_file = request.FILES[file]
            instances.append(DicomSaver.save(dicom_file))
        serializer = InstanceSerializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


def get_instance_image(request, pk):
    instance = Instance.objects.get(pk=pk)
    ds = dicom.read_file(instance.image.path)
    image = Image.fromarray(ds.pixel_array.astype(np.uint8))
    file = BytesIO()
    image.save(file, format='jpeg')
    response = HttpResponse(instance.image.file, content_type='application/dicom')
    response['Content-Disposition'] = 'attachment; filename=%s' % instance.image.name
    return response
