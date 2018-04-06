from django.core.management import BaseCommand

from apps.core.models import Plugin


class Command(BaseCommand):
    help = "Clear plugins database"

    def handle(self, *args, **options):
        for plugin in Plugin.objects.all():
            plugin.plugin.delete()
            plugin.delete()
        self.stdout.write('Completed!')
