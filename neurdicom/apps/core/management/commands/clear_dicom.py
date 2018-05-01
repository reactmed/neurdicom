from django.core.management import BaseCommand

from apps.core.models import Instance, Series, Study, Patient


class Command(BaseCommand):
    help = "Clear DICOM database"

    def handle(self, *args, **options):
        for instance in Instance.objects.all():
            instance.image.delete()
            instance.delete()
        Series.objects.all().delete()
        Study.objects.all().delete()
        Patient.objects.all().delete()
        self.stdout.write('Completed!')
