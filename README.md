# Welcome to NeurDICOM documentation
NeurDICOM is portable and easy-to-deploy RESTful DICOM and PACS server that allows physicians to use state-of-the-art methods of machine learning and neural networks to make a diagnosis based on medical images processing and interpetating.

## Content
  1. API
  2. Plugins

## API
- [Patients](docs/PatientEndpointDocs.md)
- [Studies](docs/StudyEndpointDocs.md)
- [Series](docs/SeriesEndpointDocs.md)
- [Instances](docs/InstanceEndpointDocs.md)
- [Plugins](docs/PluginsEndpointDocs.md)
- [Users](docs/UsersEndpointDocs.md)

## Plugins

Neurdicom provides API for creating plugins to extend the functionality of DICOM files processing. Plugins should be written in Python and packed as ZIP archive. Plugin should have at least two files 'META.json' and 'plugin.py'. 'META.json' describes the plugin, author and main plugin information. Expected strusture of 'META.json' is shown below:

``` json
{
	"plugin_guid": "...",
	"author": "John Doe",
	"name": "hello",
	"info": "Print hello greeting",
	"help": "To greet say 'Hello'",
	"params": {
		"name": {
			"type": "text"
		}
	}
}
```
Field "params" list all parameters which plugin expects. Each "params" field has one of several options "type", "isarray", "values", "isnull". Field "type" is obligatory and takes one of the following values:
```json
[
	"text",
	"int",
	"double"
]
```
Fields "isarray", "isnull" are boolearn or nullable. Nullable value are is considered as false.  
Plugin should have a public "Plugin" class. "Plugin" class should have at least three of the following methods "init", "process" and "destory". Example of "Plugin" class is shown below:
```python
class Plugin:
    def init(self):
        print('Init method called')

    def process(self, ds: Dataset = None, *args, **kwargs):
        print('Hello,', kwargs['name'], '!')
        return {
            'greeting': 'Hello, %s!' % kwargs['name']
        }

    def destroy(self):
        print('Destroy method called')
```
