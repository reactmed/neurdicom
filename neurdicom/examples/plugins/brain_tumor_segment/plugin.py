from pydicom import Dataset, read_file
from dipy.segment.mask import median_otsu
import numpy as np
import cv2 as cv


class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
        median_radius = kwargs.get('median_radius', 5)
        num_pass = kwargs.get('num_pass', 4)
        brain, mask = median_otsu(ds.pixel_array, median_radius=median_radius, numpass=num_pass)
        reshaped = brain.reshape((-1))
        max_val = max(reshaped)
        ret, thresh1 = cv.threshold(brain, 1000, max_val, cv.THRESH_BINARY)
        kernel = np.ones((5, 5), np.uint8)
        erosion = cv.erode(thresh1, kernel, iterations=3)
        return erosion

    def destroy(self):
        print('Destroy method called')


if __name__ == '__main__':
    ds = read_file('../../dicom/brain_cancer/000000.dcm')
    brain = Plugin().process(ds=ds, median_radius=5, num_pass=4)
    print(max(brain.reshape((-1))))
