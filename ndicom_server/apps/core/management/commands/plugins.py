from json import loads
import os
from importlib.util import find_spec
from json import loads
from urllib.request import urlopen
import tarfile as tar

import pip
from django.core.management import BaseCommand, CommandParser
from github import Github

from apps.core.models import Plugin

ORG = 'reactmed'
REPO = 'neurdicom-plugins'
META = 'META.json'
REPO_URL = 'git+git://github.com/reactmed/neurdicom-plugins.git'
REPO_WEBSITE_URL = 'https://github.com/reactmed/neurdicom-plugins.git'


class Command(BaseCommand):
    help = "Install plugins"

    def _check_method(self, cls, method_name):
        if not hasattr(cls, method_name) or not callable(getattr(cls, method_name)):
            raise ValueError('Plugin has not specific method')

    def _validate_plugin(self, plugin_name):
        try:
            plugin_cls = __import__(plugin_name).Plugin
            self._check_method(plugin_cls, '__enter__')
            self._check_method(plugin_cls, 'process')
            self._check_method(plugin_cls, '__exit__')
        except AttributeError:
            raise RuntimeError('Plugin does not have main class "Plugin"')
        except ValueError:
            pip.main(['uninstall', plugin_name])
            raise RuntimeError('Plugin %s is not valid!' % plugin_name)

    def _local_install(self, name, upgrade=True, validate=False):
        if not os.path.exists(name):
            return
        if os.path.isfile(name) and name.endswith('.tar.gz') and tar.is_tarfile(name):
            with tar.open(name) as archive:
                root_dir = archive.getmembers()[0].path
                meta_file = archive.extractfile(archive.getmember(os.path.join(root_dir, 'META.json')))
                meta_info = loads(meta_file.read())
                plugin_name = meta_info['name']
                plugin = Plugin()
                plugin.name = plugin_name
                plugin.display_name = meta_info['display_name']
                plugin.author = meta_info['author']
                plugin.version = meta_info.get('version', '1.0')
                plugin.info = meta_info.get('info', '')
                plugin.docs = meta_info.get('docs', '')
                plugin.params = meta_info.get('params', [])
                plugin.result = meta_info['result']
                plugin.tags = meta_info.get('tags', [])
                plugin.modalities = meta_info.get('modalities', [])
                plugin.type = meta_info.get('type', 'SEGMENT')
                plugin.is_installed = True
                if upgrade:
                    pip.main(['install', '--upgrade', name])
                else:
                    pip.main(['install', name])
                if find_spec(plugin_name) is None:
                    raise ModuleNotFoundError('%s was not installed!' % plugin)
                if validate:
                    self._validate_plugin(plugin_name)
            with open(name, 'rb') as archive:
                plugin.plugin.save('', archive)
                plugin.save()
            self.stdout.write('=> %s installed' % plugin_name)
        elif os.path.isdir(name):
            files = [os.path.join(name, f) for f in os.listdir(name)]
            for f in files:
                self._local_install(f)

    def _install_from_github(self, plugins, index=False, upgrade=True, validate=False):
        g = Github('39017bebb8fda61c3c75b38ec33101496484db25')
        repo = g.get_organization(ORG).get_repo(REPO)
        if index:
            root = repo.get_contents('')
            for member in root:
                if member.type == 'dir' and member.path not in plugins:
                    print(member.path)
                    meta_url = repo.get_contents('%s/META.json' % member.path).download_url
                    with urlopen(meta_url) as meta_file:
                        meta = loads(meta_file.read())
                        plugin = Plugin(
                            author=meta['author'],
                            name=meta['name'],
                            display_name=meta['display_name'],
                            version=meta.get('version', '1.0'),
                            info=meta.get('info', None),
                            docs=meta.get('docs', None),
                            modalities=meta.get('modalities', []),
                            tags=meta.get('tags', []),
                            params=meta.get('params', []),
                            result=meta['result']
                        )
                        plugin.save()

        for plugin in plugins:
            if upgrade:
                pip.main(['install', '--upgrade', '%s#subdirectory=%s' % (REPO_URL, plugin)])
            else:
                pip.main(['install', '%s#subdirectory=%s' % (REPO_URL, plugin)])
            if find_spec(plugin) is None:
                raise ModuleNotFoundError('%s was not installed!' % plugin)
            if validate:
                self._validate_plugin(plugin)

            meta_url = repo.get_contents('%s/META.json' % plugin).download_url
            with urlopen(meta_url) as meta_file:
                meta = loads(meta_file.read())
                plugin = Plugin()
                plugin.author = meta['author']
                plugin.name = meta['name']
                plugin.display_name = meta['display_name']
                plugin.version = meta.get('version', '1.0')
                plugin.info = meta.get('info', None)
                plugin.docs = meta.get('docs', None)
                plugin.modalities = meta.get('modalities', [])
                plugin.tags = meta.get('tags', [])
                plugin.params = meta.get('params', [])
                plugin.result = meta['result']
                plugin.is_installed = True
                plugin.save()
            self.stdout.write('=> %s installed' % plugin)

    def _uninstall_plugins(self, plugin_names):
        for plugin_name in plugin_names:
            pip.main(['uninstall', plugin_name])
            plugin = Plugin.objects.get(name=plugin_name)
            plugin.plugin.delete()
            plugin.delete()
            self.stdout.write('=> Plugin %s uninstalled' % plugin_name)
        self.stdout.write('Uninstalling plugins completed!')

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('locations', nargs='*', type=str, help='List of plugins')
        parser.add_argument('--install', action='store_true', dest='install', help='Install plugins')
        parser.add_argument('--uninstall', action='store_true', dest='uninstall', help='Uninstall plugins')
        parser.add_argument('--upgrade', action='store_true', dest='upgrade',
                            help='Upgrade plugins')
        parser.add_argument('--clear', action='store_true', dest='clear',
                            help='Clear plugins')
        parser.add_argument('--validate', action='store_true', dest='validate',
                            help='Validate plugins')
        parser.add_argument('--index', action='store_true', dest='index',
                            help='Index plugins from remote repository')
        parser.add_argument('--mode', action='store', dest='mode',
                            help='Install mode (mode=[LOCAL|GITHUB|PYPA]). Use "LOCAL" to install local packages '
                                 'archived as tar.gz. Use "GITHUB" to install packages from %s. Use "PYPA" to install '
                                 'packages from https://pypi.org/' % REPO_WEBSITE_URL)

    def handle(self, *args, **options):
        install = options.get('install', True)
        uninstall = options.get('uninstall', False)
        upgrade = options.get('upgrade', True)
        clear = options.get('clear', False)
        validate = options.get('validate', False)
        index = options.get('index', False)
        mode = options.get('mode', 'local')
        locations = options.get('locations', [])
        if clear:
            for plugin in Plugin.objects.all():
                plugin.plugin.delete()
                plugin.delete()
            self.stdout.write('Clear plugins completed')
        if len(locations) == 0:
            self.stdout.write('Nothing to install or uninstall')
            return
        if install and uninstall:
            raise ValueError('Can not use both install and uninstall actions')
        if index and (mode == 'LOCAL' or mode == 'PYPA'):
            raise ValueError('Can not index remote packages from github.com and install local packages at same time. '
                             'Please use either index or local arguments.')
        if uninstall:
            for location in locations:
                self._uninstall_plugins(location)
            return
        if install:
            if mode == 'LOCAL':
                for location in locations:
                    self._local_install(location)
            elif mode == 'GITHUB':
                self._install_from_github(locations, index, upgrade, validate)
            elif mode == 'PYPA':
                raise ValueError(
                    'Installing from https://pypi.org/ is not supported yet :(. In future version this will '
                    'be included.')
            self.stdout.write('Installing plugins completed!')
