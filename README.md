# FlowMake

Yet another tool for creating and exploring Flow-Based Programming (FBP) diagrams.

## Preview

## Example of a flow

![Example of a flow](https://raw.githubusercontent.com/cascades-fbp/flowmaker/master/docs/demo_net.png)

## Adding new component

![Adding new component](https://raw.githubusercontent.com/cascades-fbp/flowmaker/master/docs/demo_add_component.png)


## Installation

Open releases tab and get the binary version.

## Contributing

If you want to run the editor in _development_ mode checkout this repository and follow the installation and configuration steps below.

### Prerequisites

Make sure you have the following list of disappointments installed on your system:

 * node.js (v0.10.33+)
 * npm (v2.1.9+)
 * grunt (v0.4.5+)
 * bower (v1.3.12+)

### Installation

First install npm related development crap:
```
npm install .
```

Then install client-side dependencies using another package manager (welcome to the cruel JavaScript world!):
```
bower install .
```

### Run development version of the editor using node-webkit

Then download a binary build of [node-webkit](https://github.com/rogerwang/node-webkit) for your platform. Once you're done run the node-webkit providing the path to the root of the checked out repository as shown below (for OSX):
```
/Applications/node-webkit.app/Contents/MacOS/node-webkit ~/Projects/OpenSource/Cascades/editor
```

### Creating a desktop application

There's a grunt task for that already:

```
$ grunt app
Running "jshint:gruntfile" (jshint) task
>> 1 file lint free.

Running "concat:js_frontend" (concat) task
File ./public/assets/js/frontend.js created.

Running "concat:css_fronend" (concat) task
File ./public/assets/css/frontend.css created.

Running "nodewebkit:src" (nodewebkit) task
Latest Version: v0.11.2
Using v0.11.2
Create cache folder in /Users/alex/Projects/OpenSource/Cascades/editor/cache/0.11.2
Using cache for: osx
Create release folder in /Users/alex/Projects/OpenSource/Cascades/editor/webkitbuilds/FlowMaker/osx
>> nodewebkit app created.

Done, without errors.
```

If you need to include packaging for Windows/Linux just edit the corresponding lines in the `Gruntfile.js`

# License

node-webkit's code the MIT license, but the diagramming component (Draw2D.js) is GPLv2. Therefore the editor is GPLv2. See our LICENSE file.
