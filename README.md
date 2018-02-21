# Welcome to NeurDICOM documentation

## Content
  1. API
  2. Plugins

## API
- Patients
- Studies
- Series
- Instances
- Plugins

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
