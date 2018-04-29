#!/usr/bin/env python
import logging
import signal

logging.basicConfig(format='%(levelname)s: %(asctime)s - %(message)s', datefmt='%d.%m.%Y %I:%M:%S')

import django
import sys
from pydicom.uid import *
from pynetdicom3 import *

os.environ['DJANGO_SETTINGS_MODULE'] = 'neurdicom.settings'
django.setup()

from tornado.options import options, define, parse_command_line
from apps.dicom_ws.handlers import *
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.wsgi

define('rest_port', type=int, default=8080)
define('dicom_port', type=int, default=11112)

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
INSTANCE_UPLOAD_URL = r'/api/instances/upload'
INSTANCE_DETAIL_URL = r'/api/instances/(\d+)'
INSTANCE_IMAGE_URL = r'/api/instances/(\d+)/image'
INSTANCE_RAW_URL = r'/api/instances/(\d+)/raw'
INSTANCE_TAGS_URL = r'/api/instances/(\d+)/tags'
INSTANCE_PROCESS_URL = r'/api/instances/(\d+)/process/by_plugin/(\d+)'

DICOM_NODE_LIST_URL = r'/api/dicom_nodes'
DICOM_NODE_DETAIL_URL = r'/api/dicom_nodes/(\d+)'
DICOM_NODE_ECHO_URL = r'/api/dicom_nodes/(\d+)/echo'

PLUGIN_LIST_URL = r'/api/plugins'
PLUGIN_DETAIL_URL = r'/api/plugins/(\d+)'
PLUGIN_INSTALL_URL = r'/api/plugins/(\d+)/install'

MEDIA_URL = r'/media/(.*)'


def main():
    parse_command_line()

    rest_app = tornado.web.Application(
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
            (INSTANCE_PROCESS_URL, InstanceProcessHandler),
            (INSTANCE_TAGS_URL, InstanceTagsHandler),
            (INSTANCE_IMAGE_URL, InstanceImageHandler),
            (INSTANCE_RAW_URL, InstanceRawHandler),
            (INSTANCE_DETAIL_URL, InstanceDetailHandler),
            (INSTANCE_LIST_URL, InstanceListHandler),
            (INSTANCE_UPLOAD_URL, InstanceUploadHandler),

            # Dicom Nodes
            (DICOM_NODE_DETAIL_URL, DicomNodeDetailHandler),
            (DICOM_NODE_LIST_URL, DicomNodeListHandler),
            (DICOM_NODE_ECHO_URL, DicomNodeEchoHandler),

            # Plugins
            (PLUGIN_DETAIL_URL, PluginDetailHandler),
            (PLUGIN_LIST_URL, PluginListHandler),
            (PLUGIN_INSTALL_URL, InstallPluginHandler),

            # Media download
            (MEDIA_URL, tornado.web.StaticFileHandler, {'path': 'media'})
        ])
    new_pid = os.fork()
    if new_pid == 0:
        try:
            logging.info('DICOM server starting at port = %d' % options.dicom_port)
            dicom_server = DICOMServer(port=options.dicom_port,
                                       scp_sop_class=StorageSOPClassList + [VerificationSOPClass],
                                       transfer_syntax=UncompressedPixelTransferSyntaxes)
            dicom_server.start()
        except (KeyboardInterrupt, SystemExit):
            logging.info('DICOM server finishing...')
            logging.info('Child process exiting...')
            sys.exit(0)
    elif new_pid > 0:
        try:
            rest_server = tornado.httpserver.HTTPServer(rest_app)
            rest_server.bind(options.rest_port)
            rest_server.start()
            logging.info('Rest server starting at port = %d' % options.rest_port)
            tornado.ioloop.IOLoop.current().start()
        except (KeyboardInterrupt, SystemExit):
            logging.info('Rest server finishing...')
            os.kill(new_pid, signal.SIGINT)
            logging.info('Parent process exiting...')
            sys.exit(0)
    else:
        logging.error('Can not fork any processes')


if __name__ == '__main__':
    main()
