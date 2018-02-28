from pydicom import Dataset


class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
        return ds.pixel_array

    def destroy(self):
        print('Destroy method called')
