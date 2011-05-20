#Coweb Boilerplate with Dojo 1.7

##About

This boilerplate is a working, generic, AMD-formatted web application that has the Coweb and Dojo frameworks already configured and working. It is meant to serve as a starting point for any future applications developed for the Coweb frameworks using Dojo 1.7+ so that minimal or no setup is required.

##Quick Start

1. Clone repository
'''console
$ git clone git@github.com:bouchon/coweb-app-boilerplate-dojo1.7.git
'''
2. Download a nightly build of Dojo [[here|http://archive.dojotoolkit.org/nightly/]] and unzip.
3. Place dojo/ , dijit/ , and dojox/ inside the root of the boilerplate.
4. Open in a browser to test it out.

##A Brief Tour

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* index.html : serves as the main html file of the application
* application.js : serves as the main javascript file of the application
* application.css : serves as the main CSS of the application
* main.js : serves as the bootstrap file for the application (holds dependency list)

The following files are simply part of the configuration and shouldn't be modified:

* i18n.js : the current Dojo i18n.js isn't supported by requireJS and AMD loading in general, so this i18n script file is AMD-specific plugin that allows for internationalization.
* require.js : each AMD application needs its own copy of require.js to function properly.

##Developing

When developing an Coweb + Dojo AMD web application, there are a few key practices that are slightly different than developing a standard non-AMD Dojo app. Note that these are also documented within the code as well.

* Dependencies, e.g. dijit.layout.BorderContainer, should be listed in two places: main.js and application.js. See the code for explicit examples on where and how to list them.

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.

Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.