/**
 * 
 */
package org.coweb;

import java.util.Map;
import java.util.HashMap;
import java.util.Vector;

import org.eclipse.jetty.util.ajax.JSON;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

import java.util.logging.Logger;

/**
 * @author bouchon
 * 
 */
public class CotreeModerator extends DefaultSessionModerator {
	
	private static final Logger log = Logger.getLogger(CotreeModerator.class.getName());
			
	private Vector<Object> queue = null;
	
	public CotreeModerator() {
		super();
		this.queue = new Vector<Object>();
	}

	
	@Override
	public boolean onSync(Map<String, Object> data) {
		log.info(data.toString());
		HashMap<String, Object> sync = new HashMap<String, Object>();
		sync.put("topic", data.get("topic"));
		sync.put("value", data.get("value"));
		sync.put("position", data.get("position"));
		sync.put("type", data.get("type"));
		sync.put("force", data.get("force"));
		
		/*
		String jsonSync = JSON.toString(sync);
		this.queue.add(jsonSync);
		*/
		this.queue.add(sync);
		
		return true;
	}

	@Override
	public Object[] getLateJoinState() {
		log.info("returning late join state");
		return this.queue.toArray();
	}

	@Override
	public boolean canClientJoinSession(ServerSession client) {
		return true;
	}

	@Override
	public void onClientJoinSession(ServerSession client) {
		// here, 'q' is a queue of all ops - I was going to just send this to the 
		// late joiner, rip through the ops really quick, and they will be at the same
		// point as all other users in session.
	}

	@Override
	public void onClientLeaveSession(ServerSession client) {
		return;
	}

	@Override
	public boolean canClientSubscribeService(ServerSession client) {
		return true;
	}

	@Override
	public boolean canClientMakeServiceRequest(ServerSession client, Message botMessage) {
		return true;
	}

	@Override
	public void onServiceResponse(Message botResponse) {
		return;
	}

	@Override
	public void onSessionEnd() {
		return;
	}
	
}
