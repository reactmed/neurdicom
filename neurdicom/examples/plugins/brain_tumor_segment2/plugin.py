from pydicom import Dataset, read_file
from dipy.segment.mask import median_otsu
import numpy as np
import cv2 as cv
# import matplotlib.pyplot as plt
# import matplotlib
# import matplotlib.patches as patches
from io import BytesIO

# matplotlib.use('Agg')

MAX_BIT = 2 ** 16
THRESHOLD = 2 ** 15


class Plugin:
    def init(self):
        print('Init method called')

    def _find_tumor_bounding_box(self, img):
        min_x, min_y = img.shape[0], img.shape[1]
        max_x, max_y = 0, 0
        for y in range(img.shape[1]):
            for x in range(img.shape[0]):
                if img[x, y] != 0:
                    if min_x > x:
                        min_x = x
                    if max_x < x:
                        max_x = x
                    if min_y > y:
                        min_y = y
                    if max_y < y:
                        max_y = y
        return min_x, min_y, max_x - min_x + 1, max_y - min_y + 1

    def process(self, ds: Dataset = None, *args, **kwargs):
        mode = kwargs.get('mode', 'crop')
        # if mode == 'crop':
        median_radius = kwargs.get('median_radius', 5)
        num_pass = kwargs.get('num_pass', 4)
        threshold = kwargs.get('threshold', THRESHOLD)
        window = kwargs.get('window', (5, 5))
        iterations = kwargs.get('iterations', 3)
        brain, mask = median_otsu(ds.pixel_array, median_radius=median_radius, numpass=num_pass)
        flatten = brain.reshape((-1))
        for i in range(flatten.shape[0]):
            if flatten[i] < threshold:
                flatten[i] = 0
        # ret, thresh = cv.threshold(brain, threshold, MAX_BIT, cv.THRESH_BINARY)
        thresh = flatten.reshape(brain.shape)
        kernel = np.ones(window, dtype=np.uint16)
        res = cv.morphologyEx(thresh, cv.MORPH_OPEN, kernel, iterations=iterations)
        res = res.reshape((-1))
        original = brain.reshape((-1))
        for i in range(res.shape[0]):
            if res[i] == 0:
                original[i] = 0
        return original.reshape(brain.shape)
        # else:
        #     median_radius = kwargs.get('median_radius', 5)
        #     num_pass = kwargs.get('num_pass', 4)
        #     threshold = kwargs.get('threshold', THRESHOLD)
        #     window = kwargs.get('window', (5, 5))
        #     iterations = kwargs.get('iterations', 3)
        #     brain, mask = median_otsu(ds.pixel_array, median_radius=median_radius, numpass=num_pass)
        #     flatten = brain.reshape((-1))
        #     for i in range(flatten.shape[0]):
        #         if flatten[i] < threshold:
        #             flatten[i] = 0
        #     # ret, thresh = cv.threshold(brain, threshold, MAX_BIT, cv.THRESH_BINARY)
        #     thresh = flatten.reshape(brain.shape)
        #     kernel = np.ones(window, dtype=np.uint16)
        #     res = cv.morphologyEx(thresh, cv.MORPH_OPEN, kernel, iterations=iterations)
        #     fig, ax = plt.subplots(1)
        #     ax.imshow(brain, 'gray')
        #     min_x, min_y, columns, rows = self._find_tumor_bounding_box(res)
        #     print(min_x, min_y)
        #     rect = patches.Rectangle((min_y, min_x), rows, columns, linewidth=3, edgecolor='r', facecolor='none')
        #     ax.add_patch(rect)
        #     plt.show()
        #     out = BytesIO()
        #     fig.savefig(out, format='jpeg')
        #     return out

    def destroy(self):
        print('Destroy method called')


if __name__ == '__main__':
    ds = read_file('../../dicom/brain_cancer/000000.dcm')
    brain = Plugin().process(ds=ds, median_radius=5, num_pass=4)
    print(max(brain.reshape((-1))))
