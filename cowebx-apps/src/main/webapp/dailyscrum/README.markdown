#Coweb + Dojo1.7 Boilerplate

##About

This boilerplate is a working, generic, AMD-formatted web application that has the Coweb and Dojo frameworks already configured and working. It is meant to serve as a starting point for any future applications developed for the Coweb frameworks using Dojo 1.7+ so that minimal or no setup is required.

##Quick Start

1. If you haven't already, follow [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html) to deploy a Coweb instance.
2. Clone repository:
```
$ git clone git@github.com:bouchon/coweb-dojo1.7-boilerplate.git
```
3. Download a nightly build of Dojo [here](http://archive.dojotoolkit.org/nightly/) and unzip.
4. Place ```dojo/``` , ```dijit/``` , and ```dojox/``` inside the root of the boilerplate.
5. Open in a browser to test it out.

##A Brief Tour

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* ```index.html``` : serves as the main html file of the application
* ```application.js``` : serves as the main javascript file of the application
* ```application.css``` : serves as the main CSS of the application
* ```main.js``` : serves as the bootstrap file for the application (holds dependency list)

The following files are simply part of the configuration and shouldn't be modified:

* ```i18n.js``` : the current Dojo i18n.js isn't supported by requireJS and AMD loading in general, so this i18n script file is AMD-specific plugin that allows for internationalization.

##Development Notes

In the bootstrap file, ```main.js``` , the global dependency 'org/cometd' should be uncommented only if you are using a [Developer's Setup](https://github.com/opencoweb/coweb/wiki/Developer-Setup).

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
