from pydicom import Dataset, read_file
from dipy.segment.mask import median_otsu
import numpy as np
import cv2 as cv

MAX_BIT = 2 ** 16
THRESHOLD = 2 ** 15


class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
        median_radius = kwargs.get('median_radius', 5)
        num_pass = kwargs.get('num_pass', 4)
        threshold = kwargs.get('threshold', THRESHOLD)
        window = kwargs.get('window', (5, 5))
        iterations = kwargs.get('iterations', 3)
        brain, mask = median_otsu(ds.pixel_array, median_radius=median_radius, numpass=num_pass)
        # flatten = brain.reshape((-1))
        # for i in range(flatten.shape):
        #     if flatten[i] < threshold:
        #         flatten[i] = 0
        ret, thresh = cv.threshold(brain, threshold, MAX_BIT, cv.THRESH_BINARY)
        kernel = np.ones(window, dtype=np.uint16)
        res = cv.morphologyEx(thresh, cv.MORPH_OPEN, kernel, iterations=iterations)
        return res

    def destroy(self):
        print('Destroy method called')


if __name__ == '__main__':
    ds = read_file('../../dicom/brain_cancer/000000.dcm')
    brain = Plugin().process(ds=ds, median_radius=5, num_pass=4)
    print(max(brain.reshape((-1))))
