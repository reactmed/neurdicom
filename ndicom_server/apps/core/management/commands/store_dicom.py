from django.core.management import BaseCommand, CommandParser
import os
from apps.core.utils import DicomSaver
from apps.core.models import Patient, Instance


class Command(BaseCommand):
    help = "Store DICOM files"

    def _store(self, name):
        if not os.path.exists(name):
            return
        if os.path.isfile(name) and (name.endswith('.dicom') or name.endswith('.dcm')):
            DicomSaver.save(name)
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

    def handle(self, *args, **options):

        if options.get('clear', False):
            self.stdout.write('Clear database')
            for instance in Instance.objects.all():
                instance.image.delete()
                instance.delete()
            Patient.objects.all().delete()

        for name in options['locations']:
            self._store(name)
        self.stdout.write('Completed!')
