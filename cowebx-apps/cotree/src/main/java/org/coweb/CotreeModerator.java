/**
 *
 */
package org.coweb;

import java.util.*;
import org.eclipse.jetty.util.ajax.JSON;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

/**
 * @author bouchon
 *
 */
public class CotreeModerator extends DefaultSessionModerator {

	// Persistent object.
	private Map arr = null;
	// Unimportant globals
	private Map tmpChild = null;
	
	public CotreeModerator() {
		super();
		/* JSON.parse gives us an Object. Specifically, since our initial state
		 * is always a JSON object, JSON.parse returns a Map.
		 * See http://download.eclipse.org/jetty/stable-7/apidocs/org/eclipse/
		 * jetty/util/ajax/JSON.html for the JSON to Java mapping. */
		this.arr = (Map)JSON.parse(state);
	}

	/**
	  *
	  * This is called whenever a remote client sends a sync event (insert,
	  * update, etc). Our requirement is that we honor every request. The
	  * specific code below acts on this object's internal state to keep it in
	  * sync with other clients.
	  *
	  * @param data incoming sync message
	  */
	@Override
	public synchronized void onSync(ServerSession client,
			Map<String, Object> data) {
		// Get the value of the sync and determine the op to perform on tree
		Map value = (Map)data.get("value");
		String ty = data.get("type").toString();
		boolean force = value.containsKey("force");
		int pos = (Integer)data.get("position");

		// Normal insert
		if(ty.equals("insert") && force) {
			insert(value, pos, force);
		// Normal delete
		}else if(ty.equals("delete") && force) {
			remove(value, pos, force);
		// Modified insert
		}else if(ty.equals("insert") && !force) {
			insert(value, pos, force);
		// Modified delete
		}else if(ty.equals("delete") && !force) {
			remove(value, pos, force);
		// Normal update
		}else if(ty.equals("update")){
			update(value, pos);
		}
	}

	/* The following private methods are helper methods for onSync. */

	private void update(Map value, int pos) {
		// Get the targeted node, update the value in the tree
		Map parent = findNode(arr, (String)value.get("parentId"));
		if (null == parent) {
			System.err.printf("update: parent already deleted! %s %d\n",
					value.get("parentId"), pos);
			return;
		}
		Object[] children = (Object[])(parent.get("children"));
		if (pos >= children.length) {
			System.err.printf("update: %d.children[%d] doesn't exist.\n",
					value.get("parentId"), pos);
			return;
		}
		Map target = (Map)children[pos];
		target.put("name", value.get("name"));
	}

	// Assumes position \in [0, arr.length].
	private Object[] arrayInsertAt(Object[] arr, Object o, int pos) {
		// Too bad...we have to reallocate a new array each time!
		Object[] narr = new Object[arr.length + 1];
		System.arraycopy(arr, 0, narr, 0, pos);
		narr[pos] = o;
		System.arraycopy(arr, pos, narr, pos + 1, arr.length - pos);
		return narr;
	}

	// Assumes pos \in [0, arr.length).
	private Object[] arrayDeleteAt(Object[] arr, int pos) {
		Object[] narr = new Object[arr.length-1];
		System.arraycopy(arr, 0, narr, 0, pos);
		System.arraycopy(arr, pos + 1, narr, pos, narr.length - pos);
		return narr;
	}
	
	private void insert(Map value, int pos, boolean force){
		Map jsonObj;
		Map parent;
		// If we are doing a regular insert, create a new node and get
		// the parent by node id
		if(force){
			String jsonStr = "{\"id\":\""+value.get("id").toString()+
				"\",\"name\":\""+ value.get("value").toString()+
				"\",\"children\":[]}";
			jsonObj = (Map)JSON.parse(jsonStr);
			parent = findNode(arr, (String)value.get("parentId"));
		// If we are doing a modified insert (after a drag and drop), use
		// tmpChild instead of creating node
		}else{
			jsonObj = tmpChild;
			parent = findNode(arr, (String)value.get("newParentID"));
		}
		if (null == parent) {
			return;
		}
		// Stick the newNode / tmpChild in an array and add to
		// parent's children array
		Object[] children = (Object[])(parent.get("children"));
		if (children.length < pos) {
			System.err.printf("insert(force=%b): %d.children[%d] does not " +
					"exist.\n", force, parent.get("id"), pos);
			return;
		}
		children = arrayInsertAt(children, jsonObj, pos);
		parent.put("children",children);
	}
	
	private void remove(Map value, int pos, boolean force){
		Map parent;
		// If we are doing a regular delete, get the parent by ID
		if(force){
			parent = findNode(arr, (String)value.get("parentId"));
		// If we are doing a modified delete (after a drag and drop)
		// Get parent by prevParentID
		}else{
			parent = findNode(arr, (String)value.get("prevParentID"));
		}
		if (null == parent) {
			return;
		}
		Object[] children = (Object[])(parent.get("children"));
		if (children.length <= pos) {
			System.err.printf("delete(force=%b): %d.children[%d] does not " +
					"exist.\n", force, parent.get("id"), pos);
			return;
		}
		tmpChild = (Map)children[pos];
		children = arrayDeleteAt(children, pos);
		parent.put("children", children);
	}
	
	public Map findNode(Map map, String id) {
		return findNodeRecursive(map, id);
	}
	
	private Map findNodeRecursive(Map map, String id) {
		for(Object entry : map.entrySet()){
			Object value = ((Map.Entry)entry).getValue();
			if((value instanceof String) && ((String)value).equals(id)) {
				return map;
			} else if(value instanceof Map) {
				return findNodeRecursive((Map)value,id);
			} else if(value instanceof Object[]) {
				Map ret;
				for(int i=0; i<((Object[])value).length; i++) {
					ret = findNodeRecursive( (Map)(((Object[])value)[i]) ,id);
					if (null != ret)
						return ret;
				}
			}
		}
		return null;
	}
	
	/**
	  *
	  * Our application is relatively simple - we have one collaborative object
	  * (the phonebook) whose internal data is already in the expected format of
	  * other clients.
	  *
	  * If we had more collaborative items (perhaps a collaborative notepad),
	  * we would place those collaborative items' data into the HashMap, keyed
	  * on the collab ID.
	  *
	  * @return full application state
	  */
	public Map<String, Object> getLateJoinState() {
		HashMap<String, Object> hm = new HashMap<String, Object>();
		hm.put("phonebook", arr);
		// hm.put("notepad", notePadText);  <-- If we had a notepad as part of
		//                                      the application.
		return hm;
	}

	/* The rest of these functions are uninteresting to the
	 * CoTree application. */

	@Override
	public void onClientJoinSession(ServerSession client, Message message) {
	}

	@Override
	public boolean canClientJoinSession(ServerSession client, Message message) {
		System.out.println("canClientJoinSession" +
				client.getAttribute("username"));
		System.out.println(message);
		return true;
	}

	@Override
	public void onClientLeaveSession(ServerSession client) {
		return;
	}

	@Override
	public boolean canClientSubscribeService(String svcName, ServerSession client,
			Message message) {
		return true;
	}

	@Override
	public boolean canClientMakeServiceRequest(String svcName,
			ServerSession client, Message botMessage) {
		return true;
	}

	@Override
	public void onServiceResponse(String svcName, Map<String, Object> data,
			boolean error, boolean isPublic) {
		return;
	}

	@Override
	public void onSessionEnd() {
		return;
	}

	/* Hardcoded initial state. We will use JSON.parse to turn this into the
	 * actual backend state object. */
	private static final String state = "{\"id\":\"root\", \"name\":\"Phonebook\",\"children\":[{\"id\":\"0\",\"name\":\"Person\",\"children\":[{\"id\":\"1\",\"name\":\"firstname\",\"children\":[{\"id\":\"2\",\"name\":\"Paul\",\"children\":[]}]},{\"id\":\"3\",\"name\":\"lastname\", \"children\":[ { \"id\":\"4\", \"name\":\"Bouchon\", \"children\":[] } ] }, { \"id\":\"5\", \"name\":\"address\", \"children\":[ { \"id\":\"6\", \"name\":\"home\", \"children\":[ { \"id\":\"7\", \"name\":\"street\", \"children\":[ { \"id\":\"8\", \"name\":\"101 Happy Drive\", \"children\":[] } ] }, { \"id\":\"9\", \"name\":\"city\", \"children\":[ { \"id\":\"10\", \"name\":\"New Orleans\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"11\", \"name\":\"Person\", \"children\":[ { \"id\":\"12\", \"name\":\"firstname\", \"children\":[ { \"id\":\"13\", \"name\":\"Dan\", \"children\":[] } ] }, { \"id\":\"14\", \"name\":\"lastname\", \"children\":[ { \"id\":\"15\", \"name\":\"Gisolfi\", \"children\":[] } ] }, { \"id\":\"16\", \"name\":\"address\", \"children\":[ { \"id\":\"17\", \"name\":\"home\", \"children\":[ { \"id\":\"18\", \"name\":\"street\", \"children\":[ { \"id\":\"19\", \"name\":\"102 1337 Way\", \"children\":[] } ] }, { \"id\":\"20\", \"name\":\"city\", \"children\":[ { \"id\":\"21\", \"name\":\"Palo Alto\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"22\", \"name\":\"Person\", \"children\":[ { \"id\":\"23\", \"name\":\"firstname\", \"children\":[ { \"id\":\"24\", \"name\":\"Brian\", \"children\":[] } ] }, { \"id\":\"25\", \"name\":\"lastname\", \"children\":[ { \"id\":\"26\", \"name\":\"Burns\", \"children\":[] } ] }, { \"id\":\"27\", \"name\":\"address\", \"children\":[ { \"id\":\"28\", \"name\":\"home\", \"children\":[ { \"id\":\"29\", \"name\":\"street\", \"children\":[ { \"id\":\"30\", \"name\":\"103 Windoze Drive\", \"children\":[] } ] }, { \"id\":\"31\", \"name\":\"city\", \"children\":[ { \"id\":\"32\", \"name\":\"New York\", \"children\":[] } ] } ] } ] } ] } ] }";

}
