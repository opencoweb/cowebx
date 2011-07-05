#Coweb Daily Scrum Application

##About

This is a demo application that allows for collaborative scrum meetings via the browser using the Coweb framework.

##Quick Start

1. If you haven't already, follow [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html) to deploy a Coweb instance.
2. Clone the CowebX repository:

```console
$ git clone git@github.com:opencoweb/cowebx
```
3. Create a new directory in ```cowebx/cowebx-apps/src/main/webapp/``` and call it ```dojo-1.7-patched```
4. Download or clone a copy of Dojo, Dijit, and DojoX into the new folder
5. The file ```dojo/i18n.js``` currently has a bug (Dojo's, not ours) and needs to be patched before this app will function: on line 148, the change the following line from:

```
return require.toAbsMid(mid);
```

to:

```
return mid;
```
6. Symlink this folder to your local server environment:

```console
$ ln -s cowebx/cowebx-apps/src/main/webapp/dojo-1.7-patched ~/your/work/path/www/lib/dojo-1.7-patched
```
7. Start a coweb server instance.
8. Visit the app in your browser, with the following optional url parameters for meeting control:
	* ```length``` : n integer (or float), sets the total meeting time in minutes
	* ```invites``` : filename.json string, specifies server-side JSON file of invites, allows for phone-only users to be counted
	* ```url``` : http://... string, sets the url of the stand-in iFrame (to be replaced by Coweb Editor)
	* ```hideUrl``` : 'yes' or 'no' string, allows for the hiding of the URL bar
	
##A Brief Tour

###Usage
* CTRL + Left Arrow Key : shortcut to cycle the current speaker up one person
* CTRL + Right Arrow Key : shortcut to cycle the current speaker down one person

###Directory Structure 

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* ```index.html``` : serves as the main html file of the application
* ```application.js``` : serves as the main javascript file of the application
* ```application.css``` : serves as the main CSS of the application
* ```main.js``` : serves as the bootstrap file for the application (holds dependency list)

##Important Development Notes

* In the bootstrap file, ```main.js``` , the global dependency 'org/cometd' should be uncommented only if you are using a [Developer's Setup](https://github.com/opencoweb/coweb/wiki/Developer-Setup).
* The Maven project build tool that can be used to deploy other Coweb applications currently will NOT work with this application. This is because Daily Scrum currently uses unstable Dojo 1.7, rather than a stable, baked copy of Dojo.

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
