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
		
		String topic = (String)data.get("topic");
		topic = topic.replaceFirst("sync", "state");
		HashMap<String, Object> sync = new HashMap<String, Object>();
		sync.put("topic", topic);
		sync.put("value", data.get("value"));
		sync.put("position", data.get("position"));
		sync.put("type", data.get("type"));
		sync.put("force", data.get("force"));
		
		log.info(sync.toString());
		
		/*
		String jsonSync = JSON.toString(sync);
		this.queue.add(jsonSync);
		*/
		this.queue.add(sync);
		
		return true;
	}

	@Override
	public Object[] getLateJoinState() {
		/*
		System.out.println("returning late join state");
		System.out.println(JSON.toString(this.queue.toArray()));
		return this.queue.toArray();
		*/

		String state = "[{\"topic\":\"coweb.state.set.foobar\",\"value\":{\"d\":{\"id\":\"root\",\"name\":\"Phonebook\",\"children\":[{\"id\":\"0\",\"name\":\"Person\",\"children\":[{\"id\":\"1\",\"name\":\"firstname\",\"children\":{\"id\":\"2\",\"name\":\"Paul\"}},{\"id\":\"3\",\"name\":\"lastname\",\"children\":{\"id\":\"4\",\"name\":\"Bouchon\"}},{\"id\":\"5\",\"name\":\"address\",\"children\":{\"id\":\"6\",\"name\":\"home\",\"children\":[{\"id\":\"7\",\"name\":\"street\",\"children\":{\"id\":\"8\",\"name\":\"101 Happy Drive\"}},{\"id\":\"9\",\"name\":\"city\",\"children\":{\"id\":\"10\",\"name\":\"New Orleans\"}}]}}]},{\"id\":\"11\",\"name\":\"Person\",\"children\":[{\"id\":\"12\",\"name\":\"firstname\",\"children\":{\"id\":\"13\",\"name\":\"Dan\"}},{\"id\":\"14\",\"name\":\"lastname\",\"children\":{\"id\":\"15\",\"name\":\"Gisolfi\"}},{\"id\":\"16\",\"name\":\"address\",\"children\":{\"id\":\"17\",\"name\":\"home\",\"children\":[{\"id\":\"18\",\"name\":\"street\",\"children\":{\"id\":\"19\",\"name\":\"102 1337 Way\"}},{\"id\":\"20\",\"name\":\"city\",\"children\":{\"id\":\"21\",\"name\":\"Palo Alto\"}}]}}]},{\"id\":\"22\",\"name\":\"Person\",\"children\":[{\"id\":\"23\",\"name\":\"firstname\",\"children\":{\"id\":\"24\",\"name\":\"Brian\"}},{\"id\":\"25\",\"name\":\"lastname\",\"children\":{\"id\":\"26\",\"name\":\"Burns\"}},{\"id\":\"27\",\"name\":\"address\",\"children\":{\"id\":\"28\",\"name\":\"home\",\"children\":[{\"id\":\"29\",\"name\":\"street\",\"children\":{\"id\":\"30\",\"name\":\"103 Windoze Drive\"}},{\"id\":\"31\",\"name\":\"city\",\"children\":{\"id\":\"32\",\"name\":\"New York\"}}]}}]}]}}},{\"topic\":\"coweb.engine.state\",\"value\":[[[0,1],[0,1]],[],1,[0]]},{\"topic\":\"coweb.pause.state\",\"value\":[]}]";
		Object[] arr = (Object[])JSON.parse(state);
		return arr;
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
