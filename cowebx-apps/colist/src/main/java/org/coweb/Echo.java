/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb;

import org.coweb.bots.VanillaBot;
import org.coweb.bots.Proxy;

import java.util.Map;
import java.util.HashMap;

/**
 * Simple bot that listens for messages from the moderator and sends out
 * artificially generated visitor counts every five seconds.
 */
public class Echo extends VanillaBot {

    private Proxy proxy = null;
    private int total = 0;

    /* This is necessary for all bots. The proxy is necessary for
     * communication. */
    public void setProxy(Proxy proxy) {
       this.proxy = proxy;
    }

    @Override
	public void onShutdown() {
	}

    /*
     * Called upon session startup.
     */
    @Override
	public void init() {
	}

    /*
     * Handle messages from the moderator. The moderator will send us marker
     * positions via this mechanism.
     */
	public synchronized void onRequest(Map<String, Object> params,
            String replyToken, String username) {
	}

}

