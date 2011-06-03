#Coweb Daily Scrum Application

##About

This is a demo application that allows for collaborative scrum meetings via the browser using the Coweb framework.

##Quick Start

1. If you haven't already, follow [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html) to deploy a Coweb instance.
2. Clone the CowebX repository:

```console
$ git clone git@github.com:opencoweb/cowebx
```
3. Download or clone a copy of Dojo, Dijit, and DojoX into ```cowebx/cowebx-apps/src/main/webapp/dailyscrum/```
4. The file ```dojo/i18n.js``` currently has a bug (Dojo's, not ours) and needs to be patched before this app will function: on line 148, the change the following line from:

```
return require.toAbsMid(mid);
```

to:

```
return mid;
```
5. Start a coweb server instance.
6. Visit the app in your browser.

##A Brief Tour

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* ```index.html``` : serves as the main html file of the application
* ```application.js``` : serves as the main javascript file of the application
* ```application.css``` : serves as the main CSS of the application
* ```main.js``` : serves as the bootstrap file for the application (holds dependency list)

##Important Development Notes

* In the bootstrap file, ```main.js``` , the global dependency 'org/cometd' should be uncommented only if you are using a [Developer's Setup](https://github.com/opencoweb/coweb/wiki/Developer-Setup).


##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
