
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
import java.util.Timer;
import java.util.TimerTask;
import java.util.Random;

import org.cometd.bayeux.server.ServerSession;
import org.cometd.bayeux.Message;

/**
 * Bot class for the comap example. When a user adds a marker this bot
 * will see the sync event and start pushing info to the session.
 */
public class ZipModerator extends DefaultSessionModerator {

    private HashMap<String, Object> markers = new HashMap<String, Object>();
    private Timer timer = null;
    private SessionModerator.CollabInterface collab;
    boolean isReady = false;

    public ZipModerator() {
    }

    /**
     * Watch for sync events for marker adds and moves.
     */ 
    @Override
    public void onSync(Map<String, Object> data) {
        String topic = (String)data.get("topic");
        if (topic == null)
        	return;

        if (topic.startsWith("coweb.sync.marker")) {
            //parse the topic field to find the item after 
            //coweb.sync.marker
        	String[] seqs = topic.split("\\.");
        	String action = seqs[3];
        	String mid = seqs[4];

        	if (!action.equals("move") && !action.equals("add"))
        		return;

        	Random r = new Random();
        	int m = r.nextInt(1000);

        	this.markers.put(mid, new Integer(m));

        	if (this.timer == null) {
        		this.timer = new Timer();
        		this.timer.scheduleAtFixedRate(new ZipTimer(), 0, 5000);
        	}
        }
    }

    @Override
    public void onSessionEnd() {
        this.isReady = false;
        if (null != this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
    }

    @Override
    public boolean canClientJoinSession(ServerSession client, Message message) {
        return true;
    }

    @Override
    public boolean canClientSubscribeService(String svcName,
            ServerSession client, Message message) {
        return true;
    }

    @Override
    public boolean canClientMakeServiceRequest(String svcName,
            ServerSession client, Message mesage) {
        return true;
    }

    @Override
    public void onSessionReady() {
        this.collab = this.initCollab("comap");
        this.markers.clear();
        this.isReady = true;
        this.collab.subscribeService("datebot");
    }

    @Override
    public void onServiceResponse(String svcName, Map<String, Object> data,
            boolean error, boolean isPublic) {
        System.out.printf(
                "ZipModerator::onServiceResponse(%s,%b,%b): bot says \n  %s\n",
                svcName, error, isPublic, data);
    }

    private class ZipTimer extends TimerTask {

		@Override
		public void run() {
            ZipModerator mod = ZipModerator.this;
            if (!mod.isReady)
                return;

			Random r = new Random();
			for (String mid : markers.keySet()) {
				int m = ((Integer)markers.get(mid)).intValue();
				m += r.nextInt(10);
				markers.put(mid, new Integer(m));
			}

            mod.collab.sendSync("mod.zipvisits", markers, null, 0);
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("dummmy", 0);
            mod.collab.postService("datebot", map);
		}
    }
}

