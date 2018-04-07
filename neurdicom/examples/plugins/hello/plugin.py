from pydicom import Dataset


class Plugin:
    def init(self):
        print('HELLO STARTS')

    def process(self, ds: Dataset = None, *args, **kwargs):
        return {
            'greeting': 'Hello, %s!' % kwargs.get('name', 'John Doe')
        }

    def destroy(self):
        print('HELLO ENDS')
