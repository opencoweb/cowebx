#Coweb Share Button Widget

##About

This is a widget with the sole purpose of providing a means to save the innerHTML contents of a given DOM node by sharing via email. It is independent of the Coweb framework, and can be used on any textarea, contentEditable div, etc.

##Quick Start

1. To use this widget within a Coweb application, simply include ```cowebx/dojo/ShareButton/Button``` in your dependency list.
2. If you haven't set up an instance of the Coweb framework yet, and you wish to use this widget in that context, see [these instructions](http://opencoweb.org/ocwdocs/tutorial/install.html).
	
##Properties and Methods

###Properties

* ```shareButton``` : handle for the shareButton node
* ```sendButton``` : handle for the sendButton node
* ```emailBox``` : handle for the dialog node that appears after 'share' is clicked
* ```emailInput``` : handle for the email input box node
* ```domNode``` : the node specifying the placement of the widget
* ```listenTo``` : the node specifying the element to save
* ```shareShowing``` : is the share dialog currently showing

###Methods

* ```onShareClick(e)``` : triggered when the shareButton is clicked, whether it's showing or not
* ```onSendClick(e)``` : triggered when the sendButton is clicked, whether the email sends successfully or not

##Important Development Notes

* Minor default styling has been provided. Simply override any styles with your own to change the appearance of the widget.

##License

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
