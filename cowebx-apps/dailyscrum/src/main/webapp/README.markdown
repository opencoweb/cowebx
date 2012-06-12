#Coweb Daily Scrum Application

##About

This is a demo application that allows for collaborative scrum meetings via the browser using the Coweb framework.

##Quick Start

1. If you haven't already, follow [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html) to deploy a Coweb instance.
2. After installing either the Java server of Python server in the step above, make sure to deploy the [cowebx demos](http://opencoweb.org/ocwdocs/tutorial/install.html#deploying-the-cowebx-demos-optional).
3. Start the coweb server instance as instructed in the installation guide above.
4. Visit the app in your browser, which by default is located at [http://localhost:8080/dailyscrum/index.html](http://localhost:8080/dailyscrum/index.html).
5. You can use the following optional url parameters for meeting control:
	* ```length``` : n integer (or float), sets the total meeting time in minutes
	* ```invites``` : filename.json string, specifies server-side JSON file of invites, allows for phone-only users to be counted, with the following format:

```console
{
  "david" : false,
  "peter" : true,
  "joel" : false
}
```	
Note that true or false indicates whether a user has moderator privileges (can control meeting and activate / deactivate users).
	
##A Brief Tour

###Usage
* CTRL + Left Arrow Key : shortcut to cycle the current speaker up one person
* CTRL + Right Arrow Key : shortcut to cycle the current speaker down one person

###Directory Structure 

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* ```index.html``` : serves as the main html file of the application
* ```application.js``` : serves as the main javascript file of the application
* ```application.css``` : serves as the main CSS of the application

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
