/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb.example;

import org.coweb.bots.VanillaBot;
import org.coweb.bots.Proxy;

import java.util.Timer;
import java.util.Map;
import java.util.HashMap;
import java.util.TimerTask;
import java.util.Random;

/**
 * Simple bot that listens for messages from the moderator and sends out
 * artificially generated visitor counts every five seconds.
 */
public class ZipVisits extends VanillaBot {

    private Proxy proxy = null;
    private int total = 0;
    private Timer timer = null;
    private Map<String, Object> visits = new HashMap<String, Object>();
    private Random r = new Random();

    /* This is necessary for all bots. The proxy is necessary for
     * communication. */
    public void setProxy(Proxy proxy) {
       this.proxy = proxy;
    }

    @Override
	public void onShutdown() {
        if (null != this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
	}

    /*
     * Called upon session startup.
     */
    @Override
	public void init() {
        this.visits.clear();
        this.timer = new Timer();
        this.timer.scheduleAtFixedRate(new BotTimer(), 0, 5000);
	}

    /*
     * Handle messages from the moderator. The moderator will send us marker
     * positions via this mechanism.
     */
	public synchronized void onRequest(Map<String, Object> params, String replyToken,
            String username) {

        String uuid = (String)params.get("uuid");

        int visitCount = this.getVisitCount(params);
        this.visits.put(uuid, visitCount);

        /* The reply token is used to uniquely identify which client sent the
         * message and to distinguish between multiple messages if the client
         * has sent more than one to this service. It must be considered
         * opaque and not be altered. */
        Map<String, Object> reply = new HashMap<String, Object>();
        reply.put("reply", "acknowledged");
        this.proxy.reply(this, replyToken, reply);

	}

    private int getVisitCount(Map<String, Object> params) {
        /* params contains the latitude and longitude of the pin drop
         * location, but the truth is that we artificially generate the visit
         * count, so we don't really look at the lat/lon location. */
        synchronized (this.r) {
            return r.nextInt(1000);
        }
    }

    private void updateVisits() {
        /* We artificially increment the visit count, as if over time,
         * more visitors visit the location in question. */
        for (String uuid: this.visits.keySet()) {
            int cnt = (Integer)this.visits.get(uuid);
            synchronized (this.r) {
                cnt += this.r.nextInt(10);
            }
            this.visits.put(uuid, cnt);
        }
    }

    private class BotTimer extends TimerTask {
        @Override
        public void run() {
            ZipVisits bot = ZipVisits.this;
            bot.updateVisits();
            System.out.println("Bot: zips=" + bot.visits);
            bot.proxy.publish(bot, bot.visits);
        }
    }

}

