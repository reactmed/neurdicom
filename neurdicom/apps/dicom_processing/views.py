import json
from zipfile import ZipFile

import os

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView, ListAPIView
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from apps.core.models import Plugin, Instance
from apps.core.utils import DicomProcessor, convert_array_to_img


class PluginSerializer(ModelSerializer):
    params = SerializerMethodField()
    result = SerializerMethodField()
    modalities = SerializerMethodField()

    def get_params(self, plugin: Plugin):
        if plugin.params:
            return dict(plugin.params)
        return None

    def get_result(self, plugin: Plugin):
        if plugin.result:
            return dict(plugin.result)
        return None

    def get_modalities(self, plugin: Plugin):
        if plugin.result:
            return list(plugin.modalities)
        return None

    class Meta:
        model = Plugin
        fields = (
            'id', 'author', 'name', 'version', 'info',
            'docs', 'params', 'result', 'plugin', 'modalities', 'is_installed'
        )


class PluginsListAPIView(ListCreateAPIView):
    queryset = Plugin.objects.all()
    serializer_class = PluginSerializer
    parser_classes = (FileUploadParser,)

    def create(self, request, *args, **kwargs):
        plugin_file = request.data['file']
        with ZipFile(plugin_file) as plugin_archive:
            archive_name = plugin_archive.filelist[0].filename
            meta = plugin_archive.read(os.path.join(archive_name, 'META.json'))
            plugin_meta = json.loads(meta)
            plugin = Plugin()
            plugin.name = plugin_meta['name']
            plugin.author = plugin_meta['author']
            plugin.version = plugin_meta['version']
            plugin.info = plugin_meta['info']
            plugin.docs = plugin_meta['docs']
            plugin.params = plugin_meta['params']
            plugin.plugin.save('', plugin_file)
            plugin.save()
            serializer = self.serializer_class(plugin)
            return Response(serializer.data, status=status.HTTP_200_OK)


class PluginDetailAPIView(RetrieveDestroyAPIView):
    queryset = Plugin.objects.all()
    serializer_class = PluginSerializer


# @api_view(['POST'])
# @parser_classes((JSONParser,))
@csrf_exempt
def process_instance(request, pk):
    instance = Instance.objects.get(pk=pk)
    plugin_id = json.loads(request.body)['plugin_id']
    params = {}
    plugin = Plugin.objects.get(pk=plugin_id)
    result = DicomProcessor.process(instance, plugin, **params)
    if plugin.result['type'] == 'IMAGE':
        result = convert_array_to_img(result)
        return HttpResponse(result, content_type='image/jpeg')
    elif plugin.result['type'] == 'JSON':
        result = json.dumps(result)
        return Response(result, content_type='application/json')
    return Response(result)
