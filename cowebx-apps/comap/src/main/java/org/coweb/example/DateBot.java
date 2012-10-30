/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb.example;

import org.coweb.bots.Bot;
import org.coweb.bots.Proxy;

import java.util.Timer;
import java.util.Map;
import java.util.HashMap;
import java.util.TimerTask;

import java.util.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

/**
 * Simple bot that replies to private messages and publishes messages to all clients
 * every five seconds.
 */
public class DateBot implements Bot {

    private Proxy proxy = null;
    private int total = 0;
    private Timer timer = null;

    public void setProxy(Proxy proxy) {
       this.proxy = proxy;
    }

    /*
     * Called when a client subscribes.
     */
	public void onSubscribe(String username) {
        //System.out.println("DateBot::onSubscribe(" + username + ")");
	}

    /*
     * Called when a client unsubscribes.
     */
	public void onUnsubscribe(String username) {
        //System.out.println("DateBot::onUnsubscribe(" + username + ")");
	}

    /*
     * Called when the session ends.
     */
	public void onShutdown() {
        if (null != this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
        //System.out.println("DateBot::onShutdown()");
	}

    /*
     * Called upon session startup.
     */
	public void init() {
        //System.out.println("DateBot::init()");

        this.timer = new Timer();
        this.timer.scheduleAtFixedRate(new BotTimer(), 0, 5000);
	}

    /*
     * This is called when a client (browser or moderator) sends a private
     * message to this bot.
     */
	public synchronized void onRequest(Map<String, Object> params, String replyToken,
            String username) {
        //System.out.println("DateBot::onRequest()");

        /* We will send back the original message with the count of how many
         * times clients have sent bot messages. This is very contrived, but
         * it demonstrates how to send messages back and forth. */
        params.put("total", this.total++);

        /* The reply token is used to uniquely identify which client sent the
         * message and to distinguish between multiple messages if the client
         * has sent more than one to this service. It must be considered
         * opaque and not be altered. */
        this.proxy.reply(this, replyToken, params);

	}

    private class BotTimer extends TimerTask {
        @Override
        public void run() {
            Map<String, Object> data = new HashMap<String, Object>();
            /* Date code
             * from http://www.mkyong.com/java/java-how-to-get-current-date-time-date-and-calender/
             */
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            data.put("date", df.format(new Date()));
            DateBot.this.proxy.publish(DateBot.this, data);
        }
    }

}

