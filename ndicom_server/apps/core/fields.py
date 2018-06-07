from django.db.models import FileField
from django.db.models.fields.files import FieldFile, FileDescriptor


class ZipFieldFile(FieldFile):
    pass


class ZipFieldDescriptor(FileDescriptor):
    pass


class ZipField(FileField):
    attr_class = ZipFieldFile
    descriptor_class = ZipFieldDescriptor

    def get_internal_type(self):
        return 'ZipFieldFile'
