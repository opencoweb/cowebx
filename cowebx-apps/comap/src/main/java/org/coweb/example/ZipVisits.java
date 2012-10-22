/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb.example;

import org.coweb.bots.Bot;
import org.coweb.bots.Proxy;

import java.util.Map;

/**
 * Simple bot that tests ability of moderator to post service messages.
 */
public class ZipVisits implements Bot {

    private Proxy proxy = null;

    public void setProxy(Proxy proxy) {
       this.proxy = proxy;
    }

	public void onSubscribe(String username) {
	}

	public void onUnsubscribe(String username) {
	}
	
	public void onShutdown() {
	}
	
	public void init() {
	}

	public void onRequest(Map<String, Object> params, String replyToken, String username) {
        System.out.println("ZipVisits::onRequest()");
        params.put("date", "Milk321" + Math.random());
        this.proxy.reply(this, replyToken, params);
	}
    
}

