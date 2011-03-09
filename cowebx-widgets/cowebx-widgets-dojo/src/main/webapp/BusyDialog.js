//
// Busy dialog showing session status changes.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
dojo.provide('cowebx.BusyDialog');
dojo.require('dijit.Dialog');
dojo.require('dijit.form.Button');
dojo.require('dojo.string');
dojo.require('dojo.i18n');
dojo.requireLocalization('cowebx', 'BusyDialog');

/**
 * Dialog containing a busy indicator, status message, and cancel button.
 */
dojo.declare('cowebx.BusySheet', [dijit._Widget, dijit._Templated], {
    // reference to a session interface instance
    session: null,
    // widget template
    templatePath: dojo.moduleUrl('cowebx', 'templates/BusySheet.html'),
    widgetsInTemplate: true,

    /**
     * Called after widget properties are available.
     */
    postMixInProperties: function() {
        // load the localized labels
        this.labels = dojo.i18n.getLocalization('cowebx', 'BusyDialog');
        // failure state reached, no further updates allowed
        this._frozen = false;
        // connect to session for status updates
        this.connect(this.session, 'onStatusChange', 'setState');
    },

    uninitialize: function() {
        OpenAjax.hub.unsubscribe(this._tok);
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
        if(name == 'fail') {
            dojo.style(this.cancel_actions, 'display', 'none');
            dojo.style(this.fail_actions, 'display', 'block');
        } else if(name == 'busy') {
            dojo.style(this.fail_actions, 'display', 'none');
            dojo.style(this.cancel_actions, 'display', 'block');
        }
    },

    /**
     * Shows the busy or failure icon.
     */
    _showIcon: function(name) {
        if(name == 'fail') {
            this._frozen = true;
            dojo.addClass(this.icon, 'cowebFailIcon');
            dojo.removeClass(this.icon, 'cowebBusyIcon');
        } else if(name == 'busy') {
            dojo.addClass(this.icon, 'cowebBusyIcon');
            dojo.removeClass(this.icon, 'cowebFailIcon');
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
dojo.declare('cowebx.BusyDialog', dijit.Dialog, {
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
        dojo.addClass(this.domNode, 'cowebBusyDialog');
        // hide close button
        dojo.style(this.closeButtonNode, 'display', 'none');
    },

    /**
     * Override key handler to prevent closing with escape.
     */
    _onKey: function(evt) {
        if(evt.charOrCode == dojo.keys.ESCAPE) {
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
        if(state == 'ready' && !this._sheet.isFrozen()) {
            this.hide();
            // disable to move focus off cancel button to prevent next key 
            // stroke from triggering hidden cancel
            this._sheet.cancelButton.attr('disabled', true);
        } else {
            this.show();
        }
        // adjust dialog sizing in case the sheet changed size
        this.layout();
    }
});

// busy dialog singleton
cowebx._busyDlg = null;

/**
 * Factory function that creates a modal busy status dialog singleton.
 */
cowebx.createBusy = function(session) {
    var dlg;
    if(!cowebx._busyDlg) {
        // create a dialog box
        var lbl = dojo.i18n.getLocalization('cowebx', 'BusyDialog');
        dlg = new cowebx.BusyDialog({title : lbl.title});
        // create a busy sheet
        var sheet = new cowebx.BusySheet({session:session});
        // put the sheet in the dialog
        dlg.attr('content', sheet.domNode);
        cowebx._busyDlg = dlg;
        // return the sheet
        return sheet;
    } else {
        dlg = cowebx._busyDlg;
        return dlg._sheet;
    }
};

/**
 * Destroy the busy dialog singleton.
 */
cowebx.destroyBusy = function() {
    var dlg = cowebx._busyDlg;
    if(dlg) {
        dlg.destroyRecursive();
        cowebx._busyDlg = null;
    }
};