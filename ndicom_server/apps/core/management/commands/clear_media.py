import os
import shutil
from neurdicom.settings import BASE_DIR, MEDIA_ROOT

from django.core.management import BaseCommand


class Command(BaseCommand):
    help = "Clear DICOM directory"

    def handle(self, *args, **options):
        media_directory = os.path.join(BASE_DIR, MEDIA_ROOT)
        shutil.rmtree(media_directory)
        os.mkdir(media_directory)
        self.stdout.write('Completed!')
