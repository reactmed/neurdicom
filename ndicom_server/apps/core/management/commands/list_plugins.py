from django.core.management import BaseCommand
import urllib.request
import json


class Command(BaseCommand):
    help = "List plugins"

    def handle(self, *args, **options):
        with urllib.request.urlopen(
                'https://raw.githubusercontent.com/reactmed/neurdicom-plugins/master/REPO_META.json') as response:
            content = response.read()
            content = json.loads(content)
            for plugin in content['plugins']:
                self.stdout.write('%s\t[v%s]\t-\t%s' % (plugin['name'], plugin['meta']['version'],
                                                   plugin['meta']['display_name']))
