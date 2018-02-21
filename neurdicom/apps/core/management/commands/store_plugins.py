from django.core.management import BaseCommand, CommandParser
import os
from apps.core.models import Patient, Instance


class Command(BaseCommand):
    help = "Store plugin files"

    def _store(self, name, prefix='='):
        if not os.path.exists(name):
            return
        if os.path.isfile(name) and (name.endswith('.zip') or name.endswith('.dcm')):
            DicomSaver.save(name)
            self.stdout.write('%s%s stored' % (prefix, name))
        elif os.path.isdir(name):
            files = [os.path.join(name, f) for f in os.listdir(name)]
            for f in files:
                self._store(f, prefix=prefix + '=')
        return

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('locations', nargs='+', type=str)

    def handle(self, *args, **options):

        for instance in Instance.objects.all():
            instance.image.delete()
            instance.delete()

        Patient.objects.all().delete()
        for name in options['locations']:
            self._store(name)
        self.stdout.write('Completed!')
