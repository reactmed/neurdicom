import json
import re
from io import BytesIO

import numpy as np
import pydicom as dicom
from PIL import Image
from django.db.models import Q
from django.http import HttpResponse
from pydicom import Sequence
from rest_framework import status
from rest_framework.generics import *
from rest_framework.response import Response

from apps.core.utils import DicomSaver, DicomJsonEncoder
from apps.dicom_ws.serializers import *

# CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)
SEARCH_PARAM_RE = re.compile('(exact|startswith|endswith|contains)\s*=\s*((\w|\s|_|\^|-|\d)+)')
DATE_SEARCH_PARAM_RE = re.compile('((from=)|(to=))')
IMG_MIME_TYPE_RE = re.compile('image/(jpeg|jpg|gif|png|tiff)')


class PatientDetailAPIView(RetrieveDestroyAPIView):
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()


class PatientListAPIView(ListAPIView):
    serializer_class = PatientSerializer

    def get_queryset(self):
        patient_name = self.request.query_params.get('patient_name', None)
        patient_id = self.request.query_params.get('patient_id', None)
        filters = []
        matcher = SEARCH_PARAM_RE.match(patient_name or '')
        if matcher:
            search_param = matcher.group(1)
            patient_name = matcher.group(2)
            q_params = {
                'patient_name__' + search_param: patient_name
            }
            filters.append(Q(**q_params))
        matcher = SEARCH_PARAM_RE.match(patient_id or '')
        if matcher:
            search_param = matcher.group(1)
            patient_name = matcher.group(2)
            q_params = {
                'patient_id__' + search_param: patient_name
            }
            filters.append(Q(**q_params))
        if len(filters) == 0:
            return Patient.objects.all()
        else:
            or_q = filters[0]
            for filter_q in filters:
                or_q |= filter_q
            return Patient.objects.filter(or_q)


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


class SeriesInstanceListAPIView(ListAPIView):
    serializer_class = InstanceSerializer

    def get_queryset(self):
        series_id = self.kwargs['pk']
        return Instance.objects.filter(series_id=series_id).order_by('instance_number')


# @cache_page(CACHE_TTL)
def get_instance_image(request, pk):
    instance = Instance.objects.get(pk=pk)
    ds = dicom.read_file(instance.image.path)
    accept_format = request.META.get('HTTP_ACCEPT', 'image/jpeg')
    if not accept_format or not IMG_MIME_TYPE_RE.match(accept_format):
        accept_format = 'image/jpeg'
    accept_format = accept_format.replace('image/', '')
    pixel_array = ds.pixel_array
    orig_shape = pixel_array.shape
    flatten_img = pixel_array.reshape((-1))
    img_min = min(flatten_img)
    img_max = max(flatten_img)
    np.floor_divide(flatten_img, (img_max - img_min + 1) / 256,
                    out=flatten_img, casting='unsafe')
    img = flatten_img.astype(dtype=np.uint8).reshape(orig_shape)
    img = Image.fromarray(img)
    file = BytesIO()
    img.save(file, format=accept_format)
    file.seek(0)
    response = HttpResponse(file.read(), content_type='image/jpeg')
    response['Content-Disposition'] = 'attachment; filename=%d.jpeg' % instance.id
    return response


def get_instance_tags(request, pk):
    instance = Instance.objects.get(pk=pk)
    ds = dicom.read_file(instance.image.path)
    tags = {}
    for tag_key in ds.dir():
        tag = ds.data_element(tag_key)
        if tag_key == 'PixelData':
            continue
        if not hasattr(tag, 'name') or not hasattr(tag, 'value'):
            continue
        tag_value = tag.value
        # Временная мера - по мере рещения удалить
        if isinstance(tag_value, Sequence):
            continue
        tags[tag.name] = tag_value
    dumped_json = json.dumps(tags, cls=DicomJsonEncoder)
    response = HttpResponse(dumped_json, content_type='application/json')
    return response


def get_instance_pixels(request, pk):
    instance = Instance.objects.get(pk=pk)
    ds = dicom.read_file(instance.image.path)
    pixel_array = ds.pixel_array.tobytes()
    return HttpResponse(pixel_array, content_type='application/octet-stream')


def get_instance_8bit_pixels(request, pk):
    instance = Instance.objects.get(pk=pk)
    ds = dicom.read_file(instance.image.path)
    pixel_array = ds.pixel_array
    orig_shape = pixel_array.shape
    flatten_img = pixel_array.reshape((-1))
    img_min = min(flatten_img)
    img_max = max(flatten_img)
    np.floor_divide(flatten_img, (img_max - img_min + 1) / 256,
                    out=flatten_img, casting='unsafe')
    pixel_array = flatten_img.astype(dtype=np.uint8).reshape(orig_shape)
    pixel_array = pixel_array.tobytes()
    return HttpResponse(pixel_array, content_type='application/octet-stream')


class DicomNodeListAPIView(ListCreateAPIView):
    queryset = DicomNode.objects.all()
    serializer_class = DicomNodeSerializer


class DicomNodeDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = DicomNode.objects.all()
    serializer_class = DicomNodeSerializer
