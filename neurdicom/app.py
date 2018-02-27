#!/usr/bin/env python
import os

import django

os.environ['DJANGO_SETTINGS_MODULE'] = 'neurdicom.settings'
django.setup()

from tornado.options import options, define, parse_command_line
from apps.dicom_ws.handlers import *
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.wsgi

define('port', type=int, default=8080)

PATIENT_LIST_URL = r'/api/patients'
PATIENT_DETAIL_URL = r'/api/patients/(\d+)'
PATIENT_STUDIES_URL = r'/api/patients/(\d+)/studies'

STUDY_LIST_URL = r'/api/studies'
STUDY_DETAIL_URL = r'/api/studies/(\d+)'
STUDY_SERIES_URL = r'/api/studies/(\d+)/series'

SERIES_LIST_URL = r'/api/series'
SERIES_DETAIL_URL = r'/api/series/(\d+)'
SERIES_INSTANCES_URL = r'/api/series/(\d+)/instances'

INSTANCE_LIST_URL = r'/api/instances'
INSTANCE_DETAIL_URL = r'/api/instances/(\d+)'
INSTANCE_IMAGE_URL = r'/api/instances/(\d+)/image'
INSTANCE_TAGS_URL = r'/api/instances/(\d+)/tags'


class HelloHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('Hello from tornado')


def main():
    parse_command_line()

    # wsgi_app = get_wsgi_application()
    # container = tornado.wsgi.WSGIContainer(wsgi_app)

    tornado_app = tornado.web.Application(
        [
            # Patients
            (PATIENT_STUDIES_URL, PatientStudiesHandler),
            (PATIENT_DETAIL_URL, PatientDetailHandler),
            (PATIENT_LIST_URL, PatientListHandler),

            # Studies
            (STUDY_SERIES_URL, StudySeriesHandler),
            (STUDY_DETAIL_URL, StudyDetailHandler),
            (STUDY_LIST_URL, StudyListHandler),

            # Series
            (SERIES_INSTANCES_URL, SeriesInstancesHandler),
            (SERIES_DETAIL_URL, SeriesDetailHandler),
            (SERIES_LIST_URL, SeriesListHandler),

            # Instances
            (INSTANCE_TAGS_URL, InstanceTagsHandler),
            (INSTANCE_IMAGE_URL, InstanceImageHandler),
            (INSTANCE_DETAIL_URL, InstanceDetailHandler),
            (INSTANCE_LIST_URL, InstanceListHandler),
        ])

    server = tornado.httpserver.HTTPServer(tornado_app)
    server.listen(options.port)

    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    main()
