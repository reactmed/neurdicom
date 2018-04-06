from apps.core.handlers import BaseNeurDicomHandler, BaseJsonHandler
from apps.core.models import Instance, Plugin

from apps.core.utils import DicomProcessor, convert_array_to_img


class DicomProcessorHandler(BaseJsonHandler):

    def get(self, instance_id, plugin_id, *args, **kwargs):
        instance = Instance.objects.get(pk=instance_id)
        plugin = Plugin.objects.get(pk=plugin_id)
        result = DicomProcessor.process(instance, plugin, **self.request.query_parameters)
        if plugin.result['type'] == 'IMAGE':
            result = convert_array_to_img(result)
            self.set_header('Content-Type', 'image/jpeg')
            BaseNeurDicomHandler.write(self, result)
        elif plugin.result['type'] == 'JSON':
            self.write(result)
        self.write_error(500, message='Result type is not found')
