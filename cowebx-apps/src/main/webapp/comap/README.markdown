#Comap Application

##About

This is a demo application that allows for collaborative control of a Google map via the browser using the [Open Coweb Framework](http://opencoweb.org/).

##Quick Start

1. If you haven't already, follow [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html) to deploy a Coweb instance.
2. After installing either the Java server of Python server in the step above, make sure to deploy the [cowebx demos](http://opencoweb.org/ocwdocs/tutorial/install.html#deploying-the-cowebx-demos-optional).
3. Start the coweb server instance as instructed in the installation guide above.
4. Visit the app in your browser, which my default is located at [http://localhost:8080/cowebx-apps/comap/index.html](http://localhost:8080/cowebx-apps/comap/index.html).
	
##A Brief Tour

The structure of this directory is extremely straight forward. The following files are all you need to worry about when developing:

* ```index.html``` : serves as the main html file of the application
* ```comap.js``` : serves as the main javascript file of the application
* ```comap.css``` : serves as the main CSS of the application
* ```main.js``` : serves as the bootstrap file for the application (holds dependency list)

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
