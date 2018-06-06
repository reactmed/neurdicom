from pydicom import Dataset, read_file
from dipy.segment.mask import median_otsu
import numpy as np


class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
        median_radius = kwargs.get('median_radius', 5)
        num_pass = kwargs.get('num_pass', 4)
        brain, mask = median_otsu(ds.pixel_array, median_radius=median_radius, numpass=num_pass)
        return brain

    def destroy(self):
        print('Destroy method called')


if __name__ == '__main__':
    ds = read_file('../../dicom/brain_cancer/000000.dcm')
    brain = Plugin().process(ds=ds, median_radius=5, num_pass=4)
    print(max(brain.reshape((-1))))
