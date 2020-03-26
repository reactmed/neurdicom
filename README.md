# Welcome to NeurDICOM documentation

## Welcome to everyone

**Hello, everyone! I'm very excited that Github's community is interested in my project. Unfortunatly, this project needs improvements in performance and stability. I plan to rewrite some code and replace technologies which I used in first version. It would be great if you bring new fresh ideas to enhance application.**

---

NeurDICOM is portable and easy-to-deploy RESTful DICOM and PACS server that allows physicians to use state-of-the-art methods of machine learning and neural networks to make a diagnosis based on medical images processing and interpetating.

## Content
  ### 1. API
  	1.1. Patients
	1.2. Studies
	1.3. Series
	1.4. Instances
	1.5. Plugins

  ### 2. Plugins

## :red_circle: 1. API
- [Users](docs/UsersApiDocs.md)
- [Patients](docs/PatientsApiDocs.md)
- [Studies](docs/StudiesApiDocs.md)
- [Series](docs/SeriesApiDocs.md)
- [Instances](docs/InstancesApiDocs.md)
- [Plugins](docs/PluginsApiDocs.md)
- [Models](docs/ModelsApiDocs.md)
- [DICOM nodes](docs/DicomNodesApiDocs.md)

### :green_book: 1.1. Patients

**Base URL:** /api

| Resource  | Description  |
| ------------ | ------------ |
| GET /patients  | Find all patients  |
| GET /patients/:id  | Find patient by id  |
| GET /patients/:id/studies  | Find studies for patient  |
| PUT /patients/:id  | Update patient  |
| DELETE /patients/:id  | Delete patient  |

#### GET /patients
**Description**: Find all patients

#### GET /patients/:id
**Description**: Find patient by id

#### GET /patients/:id/studies
**Description**: Find patient's studies

#### PUT /patients/:id
**Description**: Update patient

#### DELETE /patients/:id
**Description**: Delete patient

### :green_book:  1.3 Studies

**Base URL:** /api

| Resource  | Description  |
| ------------ | ------------ |
| GET /studies  | Find all patients  |
| GET /studies/:id  | Find patient by id  |
| GET /studies/:id/series  | Find studies for patient  |
| PUT /studies/:id  | Update study  |
| DELETE /studies/:id  | Delete study  |

#### GET /studies
**Description**: Find all studies

#### GET /studies/:id
**Description**: Find study by id

#### GET /studies/:id/series
**Description**: Find study's series

#### PUT /studies/:id
**Description**: Update study

#### DELETE /studies/:id
**Description**: Delete study

### :green_book: 1.3 Series

**Base URL:** /api

| Resource  | Description  |
| ------------ | ------------ |
| GET /series  | Find all series  |
| GET /series/:id  | Find series by id  |
| GET /series/:id/instances  | Find series' instances  |
| PUT /series/:id  | Update series |
| DELETE /series/:id  | Delete series |

#### GET /series
**Description**: Find all series

#### GET /series/:id
**Description**: Find series by id

#### GET /series/:id/instances
**Description**: Find series' instances

#### PUT /series/:id
**Description**: Update series

#### DELETE /series/:id
**Description**: Delete series

### :green_book: 1.4 Instances

**Base URL:** /api

| Resource  | Description  |
| ------------ | ------------ |
| GET /instances | Find all instance  |
| GET /instances/:id  | Find instance by id  |
| GET /instances/:id/tags  | Get instance's tags  |
| GET /instances/:id/image  | Get instance's image  |
| GET /instances/:id/raw  | Get instance's raw pixel data in bytes  |
| GET /instances/:instance_id/process/by_plugin/:plugin_id  | Process instance by plugin  |
| PUT /instances/:id  | Update instance |
| DELETE /instances/:id  | Delete instance |

#### GET /instances
**Description**: Find all instances

#### GET /instances/:id
**Description**: Find instances by id

#### GET /instances/:id/tags
**Description**: Get instance's tags

#### GET /instances/:id/image
**Description**: Get instance's image

#### GET /instances/:id/raw
**Description**: Get instance's raw pixel data in bytes

#### GET /instances/:instance_id/process/by_plugin/:plugin_id 
**Description**: Process instance by plugin

#### POST /instances
**Description**: Save instance

#### PUT /instances/:id
**Description**: Update instance

#### DELETE /instances/:id
**Description**: Delete instance

### :green_book: 1.5 Plugins

**Base URL:** /api

| Resource  | Description  |
| ------------ | ------------ |
| GET /plugins  | Find all plugins  |
| GET /plugins/:id  | Find plugin by id  |
| POST /plugins | Upload plugin  |
| DELETE /plugins/:id  | Delete plugin  |

#### GET /plugins
**Description**: Find all plugins

#### GET /plugins/:id
**Description**: Find plugin by id

#### POST /plugins
**Description**: Upload plugin

#### DELETE /plugins/:id
**Description**: Delete plugin


## :red_circle: 2. Plugins

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
Also you can write plugins in C/C++. All C/C++ plugins should be createad as a shared library and compiled at the specific target. Library should contain exposed extern C-functions to provide an access to plugin class. For example:

Our library contains 4 files: library.h, library.cpp, plugin.h, plugin.cpp
library.h and library.cpp contain defintions of C-functions which provide access to plugin initialization, processing and destruction:

library.h
```c++
#include "Plugin.h"

extern "C" Plugin* InitPlugin();
extern "C" double* Process(Plugin *plugin, double *img, int width, int height, const char* params);
extern "C" void DestroyPlugin(Plugin* plugin);
```

library.cpp
```c++
#include "library.h"
extern "C" {

    Plugin* InitPlugin(){
        return new Plugin;
    }

    double* Process(Plugin *plugin, double *img, int width, int height, const char* params) {
        return plugin->process(img, width, height, params);
    }

    void DestroyPlugin(Plugin *plugin){
        delete plugin;
    }
}
```

Plugin class should contain constructor, processing function and destructor. Processing function should accept at least 4 parameters: image as double array, width, height and additional parameters passed as json string. 

plugin.h
```c++
class Plugin {
public:
    Plugin();
    double *process(double *, int, int, const char *params);
    ~Plugin();
};
```

plugin.cpp
```c++
#include "Plugin.h"
#include "json.hpp"
#include <iostream>

#include "json.hpp"

// for convenience
using json = nlohmann::json;

using namespace std;

double *Plugin::process(double *img, int w, int h, const char *params) {
    cout << "Processing image" << endl;
    cout << params << endl;
    auto j = json::parse(params);
    double factor = j["factor"].get<double>();
    for (int r = 0; r < w * h; r++) {
        img[r] = factor - img[r];
    }
    return img;
}

Plugin::Plugin() {
    cout << "Initializing plugin" << endl;
}

Plugin::~Plugin() {
    cout << "Destroying plugin" << endl;
}
```

## References

 1. http://bikulov.org/blog/2013/10/01/using-cuda-c-plus-plus-functions-in-python-via-star-dot-so-and-ctypes/ 
