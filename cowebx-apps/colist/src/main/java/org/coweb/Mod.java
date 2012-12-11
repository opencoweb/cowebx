
/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb;

import org.coweb.DefaultSessionModerator;
import org.coweb.SessionModerator;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Bot class for the comap example. When a user adds a marker this bot
 * will see the sync event and start pushing info to the session.
 */
public class Mod extends DefaultSessionModerator {

    private SessionModerator.CollabInterface collab;
    boolean isReady = false;

    public Mod() {
    }

    @Override
    public void onSync(String clientId, Map<String, Object> data) {
        String topic = (String)data.get("topic");
        if (topic.equals("coweb.sync.change.shoppinglist")) {
            this.collab.sendSync("chat", "hello", "insert", 0);
        }
    }

    @Override
    public void onSessionEnd() {
        /* When the session ends (all clients leave), we must stop sending
         * the pin drop list to the bot. */
        this.collab = null;
        this.isReady = false;
    }

    @Override
    public boolean canClientJoinSession(String clientId,
            Map<String, Object> userDefined) {
        String token = (String)userDefined.get("token");
        return "shopper".equals(token);
    }

    @Override
    public boolean canClientMakeServiceRequest(String svcName, String clientId,
            Map<String, Object> botData) {
        return true;
    }

    @Override
    public void onSessionReady() {
        /* When the session is ready, create a new CollabInterface, so we can
         * talk to the service bot. */
        this.collab = this.initCollab("shoppinglist");
        this.isReady = true;
    }

    @Override
    public void onServiceResponse(String svcName, Map<String, Object> data,
            boolean error, boolean isPub) {
        /* The bot will send us an acknowledge message, but we just
         * ignore it. */
    }

}

