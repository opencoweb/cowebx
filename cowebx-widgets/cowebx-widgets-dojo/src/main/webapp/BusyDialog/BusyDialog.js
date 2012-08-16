//
// Busy dialog showing session status changes.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global dojo dijit window cowebx*/
define([
'dijit/Dialog', 
'dojo/_base/declare',
'dijit/_Widget',
'dijit/_TemplatedMixin',
'dijit/_WidgetsInTemplateMixin',
'dojo/dom-class',
'dojo/dom-style',
'dojo/text!./templates/BusySheet.html',
'dojo/i18n',
'dojo/i18n!./nls/BusyDialog',
'dijit/form/Button'
], 
function(Dialog, declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, domClass, domStyle, template, i18n) {

var messages = i18n.getLocalization("cowebx.dojo.BusyDialog", "BusyDialog"); 

/**
 * Dialog containing a busy indicator, status message, and cancel button.
 */
var BusySheet = declare('cowebx.BusySheet', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // reference to a session interface instance
    session: null,
    // widget template
	templateString: template,
	
    /**
     * Called after widget properties are available.
     */
    postMixInProperties: function() {
    	this.labels = messages;
        // failure state reached, no further updates allowed
        this._frozen = false;
        // connect to session for status updates
        this.connect(this.session, 'onStatusChange', 'setState');
    },

	postCreate: function(){
		this._loadTemplate('http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css');
		this._loadTemplate('http://ajax.googleapis.com/ajax/libs/dojo/1.6/dijit/themes/claro/claro.css');
		this._loadTemplate(require.toUrl('cowebx/dojo/BusyDialog/styles/claro/claro.css'));
	},
	
	_loadTemplate : function(url) {
        var e = document.createElement("link");
        e.href = url;
        e.type = "text/css";
        e.rel = "stylesheet";
        e.media = "screen";
        document.getElementsByTagName("head")[0].appendChild(e);
    },
    
    /**
     * Gets if the busy dialog is frozen after reaching a terminal state.
     */
    isFrozen: function() {
        return this._frozen;
    },

    /**
     * Called by session to set the state indicating the status message to 
     * display in the busy sheet.
     *
     * @param state Busy state tag
     */
    setState: function(state) {
        // don't allow any further changes after a failure
        if(this._frozen) {return;}
        var bundle = this.labels[state];
        this.status.innerHTML = bundle.status;
        this.hint.innerHTML = bundle.hint;
        this._showIcon(bundle.icon);
        this._showActions(bundle.actions);
    },

    /**
     * Shows the failure or cancel actions.
     */
    _showActions: function(name) {
        if(name === 'fail') {
            domStyle.set(this.cancel_actions, 'display', 'none');
            domStyle.set(this.fail_actions, 'display', 'block');
        } else if(name === 'busy') {
            domStyle.set(this.fail_actions, 'display', 'none');
            domStyle.set(this.cancel_actions, 'display', 'block');
        }
    },

    /**
     * Shows the busy or failure icon.
     */
    _showIcon: function(name) {
        if(name === 'fail') {
            this._frozen = true;
            domClass.add(this.icon, 'cowebFailIcon');
            domClass.remove(this.icon, 'cowebBusyIcon');
        } else if(name === 'busy') {
            domClass.add(this.icon, 'cowebBusyIcon');
            domClass.remove(this.icon, 'cowebFailIcon');
        }
    },
    
    /**
     * Called when the user clicks the cancel button.
     */
    _onCancel: function(event) {
        // tell the session to abort
        this.session.leave();
    },

    /**
     * Called when the user clicks the back button.
     */
    _onBack: function(event) {
        history.go(-1);
    },

    /**
     * Called when the user clicks the refresh button.
     */
    _onRefresh: function(event) {
        window.location.reload();
    }
});

/**
 * Dialog containing the busy sheet.
 */
var BusyDialog = dojo.declare('cowebx.BusyDialog', Dialog, {
    // assume content is parsed for us by default
    parseOnLoad: false,
    // no dragging, to assist with popup z-index problems
    draggable: false,
    /**
     * Override base to initialize the sheet reference variable.
     */
    postMixInProperties: function() {
        this._sheet = null;
        this.inherited(arguments);
    },

    /**
     * Override base implementation to hide the close eye catcher.
     */
    postCreate: function() {
        // call base class
        this.inherited(arguments);
        // busy dialog style
        domClass.add(this.domNode, 'cowebBusyDialog');
        // hide close button
        domStyle.set(this.closeButtonNode, 'display', 'none');
    },

    /**
     * Override key handler to prevent closing with escape.
     */
    _onKey: function(evt) {
        if(evt.charOrCode === dojo.keys.ESCAPE) {
            return;
        }
        this.inherited(arguments);
    },
    
    /**
     * Override base implementation to connect to important content events.
     */
    _setContentAttr: function(data) {
        this.inherited(arguments);
        this._sheet = dijit.byNode(data);
        this.connect(this._sheet, 'setState', 'setState');
    },

    /**
     * Called when setState is invoked on the sheet. Hides the dialog in ready
     * and failure states, but only if the sheet is not already in a frozen
     * state.
     *
     * @param state One of SessionInterface status strings
     */
    setState: function(state) {
        if(state === 'ready' && !this._sheet.isFrozen()) {
            this.hide();
            // disable to move focus off cancel button to prevent next key 
            // stroke from triggering hidden cancel
            this._sheet.cancelButton.attr('disabled', true);
        } else {
            this.show();
        }
        // adjust dialog sizing in case the sheet changed size
        this.resize(); // In dojo 1.8.0, use resize(). 1.7.0 used layout(). Both methods
                       // are private, hence the methods changing names without notice...
    }
});

// busy dialog singleton
var _busyDlg = null;

return {
	/**
	 * Factory function that creates a modal busy status dialog singleton.
	 */
	createBusy: function(session) {
		var dlg;
		if(!_busyDlg) {
			// create a dialog box
			dlg = new BusyDialog({title : messages.title});
			// create a busy sheet
			var sheet = new BusySheet({session:session});
			// put the sheet in the dialog
			dlg.attr('content', sheet.domNode);
			_busyDlg = dlg;
			// return the sheet
			return sheet;
		} else {
			dlg = _busyDlg;
			return dlg._sheet;
		}
	},
	
	/**
	 * Destroy the busy dialog singleton.
	 */
	destroyBusy: function() {
		var dlg = _busyDlg;
		if(dlg) {
			dlg.destroyRecursive();
			_busyDlg = null;
		}
	}
};

});
