from pydicom import read_file
from tornado.web import Application, RequestHandler
from tornado.ioloop import IOLoop

from handlers import BaseDicomImageHandler


# class MainHandler(BaseDicomImageHandler):
#     def get(self):
#         ds = read_file('brain2.dcm')
#         self.write(ds)


def make_app():
    return Application(
        # [
        #     (r'/', MainHandler)
        # ]
    )


def main():
    app = make_app()
    app.listen(8080)
    IOLoop.current().start()


if __name__ == '__main__':
    main()
