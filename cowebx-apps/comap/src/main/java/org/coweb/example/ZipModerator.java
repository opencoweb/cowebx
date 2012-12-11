
/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb.example;

import org.coweb.DefaultSessionModerator;
import org.coweb.SessionModerator;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Bot class for the comap example. When a user adds a marker this bot
 * will see the sync event and start pushing info to the session.
 */
public class ZipModerator extends DefaultSessionModerator {

    private SessionModerator.CollabInterface collab;
    boolean isReady = false;

    public ZipModerator() {
    }

    /**
     * Watch for sync events for marker adds and moves.
     */ 
    @Override
    public void onSync(String clientId, Map<String, Object> data) {
        String topic = (String)data.get("topic");
        if (topic == null)
        	return;

        if (topic.startsWith("coweb.sync.marker")) {
            /* Parse the topic field to find the item after
             * coweb.sync.marker. */
        	String[] seqs = topic.split("\\.");
        	String action = seqs[3];
        	String mid = seqs[4]; /* UUID of pin. */

        	if (action.equals("add") || action.equals("move")) {
                this.updateBot(mid, (Map<String, Object>)data.get("value"));
            }
        }
    }

    private void updateBot(String mid, Map<String, Object> value) {
        value.put("uuid", mid);
        this.collab.postService("zipvisits", value);
    }

    @Override
    public void onSessionEnd() {
        /* When the session ends (all clients leave), we must stop sending
         * the pin drop list to the bot. */
        this.collab = null;
        this.isReady = false;
    }

    @Override
    public boolean canClientMakeServiceRequest(String svcName, String clientId,
            Map<String, Object> botData) {
        /* Disallow the client from making service requests, since it is not
         * necessary anyway. */
        return false;
    }

    @Override
    public boolean canClientSubscribeService(String svcName,
            String clientId) {
        /* Do allow the client to subscribe to the service, since this is how
         * the client will receive the visit count data. */
        return true;
    }

    @Override
    public void onSessionReady() {
        /* When the session is ready, create a new CollabInterface, so we can
         * talk to the service bot. */
        this.collab = this.initCollab("comap");
        this.isReady = true;
    }

    @Override
    public void onServiceResponse(String svcName, Map<String, Object> data,
            boolean error, boolean isPub) {
        /* The bot will send us an acknowledge message, but we just
         * ignore it. */
    }

}

