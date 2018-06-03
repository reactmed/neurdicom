import os
import zipfile

from django.core.management import BaseCommand, CommandParser

from apps.core.models import Plugin
from apps.core.utils import PluginSaver


class Command(BaseCommand):
    help = "Install plugins"

    def _store(self, name, is_native=False):
        if not os.path.exists(name):
            return
        if os.path.isfile(name) and zipfile.is_zipfile(name):
            PluginSaver.save(fp=name, is_native=is_native)
            self.stdout.write('%s stored' % name)
        elif os.path.isdir(name):
            files = [os.path.join(name, f) for f in os.listdir(name)]
            for f in files:
                self._store(f)
        return

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('locations', nargs='+', type=str)
        parser.add_argument('--clear', action='store_true', dest='clear',
                            help='Clear database')
        parser.add_argument('--native', action='store_true', dest='native',
                            help='Store plugins as native')

    def handle(self, *args, **options):
        if options.get('clear', False):
            self.stdout.write('Clear')
            for plugin in Plugin.objects.all():
                plugin.plugin.delete()
                plugin.delete()
        for name in options['locations']:
            self._store(name, is_native=options.get('native', False))
        self.stdout.write('Completed!')
