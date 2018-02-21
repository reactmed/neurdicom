import json
from zipfile import ZipFile

import os

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.generics import ListCreateAPIView, RetrieveDestroyAPIView, ListAPIView
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from apps.core.models import Plugin, Instance
from apps.core.utils import DicomProcessor


class PluginSerializer(ModelSerializer):
    params = SerializerMethodField()

    def get_params(self, plugin: Plugin):
        return dict(plugin.params)

    class Meta:
        model = Plugin
        fields = ('id', 'author', 'name', 'version', 'info', 'docs', 'params', 'plugin')


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


@api_view(['POST'])
@parser_classes((JSONParser,))
def process_instance(request, pk):
    instance = Instance.objects.get(pk=pk)
    plugin_id = request.data['plugin_id']
    params = request.data['params']
    plugin = Plugin.objects.get(pk=plugin_id)
    result = DicomProcessor.process(instance, plugin, **params)
    return Response(result)
