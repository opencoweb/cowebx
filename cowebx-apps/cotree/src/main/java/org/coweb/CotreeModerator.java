/**
 * 
 */
package org.coweb;

import java.util.*;
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
	// initial JSON state
	private String state = "{\"id\":\"root\", \"name\":\"Phonebook\",\"children\":[{\"id\":\"0\",\"name\":\"Person\",\"children\":[{\"id\":\"1\",\"name\":\"firstname\",\"children\":[{\"id\":\"2\",\"name\":\"Paul\",\"children\":[]}]},{\"id\":\"3\",\"name\":\"lastname\", \"children\":[ { \"id\":\"4\", \"name\":\"Bouchon\", \"children\":[] } ] }, { \"id\":\"5\", \"name\":\"address\", \"children\":[ { \"id\":\"6\", \"name\":\"home\", \"children\":[ { \"id\":\"7\", \"name\":\"street\", \"children\":[ { \"id\":\"8\", \"name\":\"101 Happy Drive\", \"children\":[] } ] }, { \"id\":\"9\", \"name\":\"city\", \"children\":[ { \"id\":\"10\", \"name\":\"New Orleans\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"11\", \"name\":\"Person\", \"children\":[ { \"id\":\"12\", \"name\":\"firstname\", \"children\":[ { \"id\":\"13\", \"name\":\"Dan\", \"children\":[] } ] }, { \"id\":\"14\", \"name\":\"lastname\", \"children\":[ { \"id\":\"15\", \"name\":\"Gisolfi\", \"children\":[] } ] }, { \"id\":\"16\", \"name\":\"address\", \"children\":[ { \"id\":\"17\", \"name\":\"home\", \"children\":[ { \"id\":\"18\", \"name\":\"street\", \"children\":[ { \"id\":\"19\", \"name\":\"102 1337 Way\", \"children\":[] } ] }, { \"id\":\"20\", \"name\":\"city\", \"children\":[ { \"id\":\"21\", \"name\":\"Palo Alto\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"22\", \"name\":\"Person\", \"children\":[ { \"id\":\"23\", \"name\":\"firstname\", \"children\":[ { \"id\":\"24\", \"name\":\"Brian\", \"children\":[] } ] }, { \"id\":\"25\", \"name\":\"lastname\", \"children\":[ { \"id\":\"26\", \"name\":\"Burns\", \"children\":[] } ] }, { \"id\":\"27\", \"name\":\"address\", \"children\":[ { \"id\":\"28\", \"name\":\"home\", \"children\":[ { \"id\":\"29\", \"name\":\"street\", \"children\":[ { \"id\":\"30\", \"name\":\"103 Windoze Drive\", \"children\":[] } ] }, { \"id\":\"31\", \"name\":\"city\", \"children\":[ { \"id\":\"32\", \"name\":\"New York\", \"children\":[] } ] } ] } ] } ] } ] }";
	// persistant complex tree
	private HashMap arr = (HashMap)JSON.parse(state);
	// Unimportant globals
	private HashMap parentNode = null;
	private HashMap tmpChild = null; 
	
	public CotreeModerator() {
		super();
	}

	@Override
	public boolean onSync(Map<String, Object> data) {
		// Get the value of the sync and determine the op to perform on tree
		HashMap value = (HashMap)data.get("value");

		// Normal insert
		if(data.get("type").toString().equals("insert") && (value.containsKey("force") == true)){
			insert(value, value.containsKey("force"));
		// Normal delete
		}else if(data.get("type").toString().equals("delete") && (value.containsKey("force") == true)){
			remove(value, value.containsKey("force"));
		// Modified insert
		}else if(data.get("type").toString().equals("insert") && (value.containsKey("force") == false)){
			insert(value, value.containsKey("force"));
		// Modified delete
		}else if(data.get("type").toString().equals("delete") && (value.containsKey("force") == false)){
			remove(value, value.containsKey("force"));
		// Normal update
		}else if(data.get("type").toString().equals("update")){
			update(value, value.containsKey("force"));			
		}
		
		return true;
	}
	
	public void update(HashMap value, boolean force){
		// Get the targeted node, update the value in the tree
		HashMap target = findNode(arr, (String)value.get("id"));
		String newValue = (String)value.get("name");
		target.put("name",newValue);
	}
	
	public void insert(HashMap value, boolean force){
		HashMap jsonObj;
		HashMap parent;
		// If we are doing a regular insert, create a new node and get 
		// the parent by node id
		if(force){
			String jsonStr = "{\"id\":\""+value.get("id").toString()+"\",\"name\":\""+value.get("value").toString()+"\",\"children\":[]}";
			jsonObj = (HashMap)JSON.parse(jsonStr);
			parent = findNode(arr, (String)value.get("parentID"));
		// If we are doing a modified insert (after a drag and drop), use 
		// tmpChild instead of creating node
		}else{
			jsonObj = tmpChild;
			parent = findNode(arr, (String)value.get("newParentID"));
		}
		// Stick the newNode / tmpChild in an array and add to
		// parent's children array
		Object[] newItem = new Object[1];
		newItem[0] = jsonObj;
		Object[] children = (Object[])(parent.get("children"));
		children = concat(newItem, children);
		parent.remove("children");
		parent.put("children",children);
	}
	
	public void remove(HashMap value, boolean force){
		String id; HashMap parent;
		// If we are doing a regular delete, get the parent by ID
		if(force){
			id = value.get("id").toString();
			parent = findNode(arr, (String)value.get("parentID"));
		// If we are doing a modified delete (after a drag and drop)
		// Get parent by prevParentID
		}else{
			id = value.get("targetID").toString();
			parent = findNode(arr, (String)value.get("prevParentID"));
		}
		// Get parent's children array
		Object[] children = (Object[])(parent.get("children"));
		Object[] tmp = null;
		// Delete the targeted item from the children array
		List result = new LinkedList();
		for(int i=0; i<children.length; i++){
			HashMap child = (HashMap)children[i];
			if(!child.get("id").toString().equals(id))
				result.add(child);
			else
				tmpChild = child;
		}
		// Update parents children array
		tmp = result.toArray(new Object[0]);
		parent.remove("children");
		parent.put("children",tmp);
	}
	
	public HashMap findNode(HashMap map, String id) {
		parentNode = null;
		findNodeRecursive(map, id);
		return parentNode;
	}
	
	public void findNodeRecursive(HashMap map, String id) {
		for(Object entry : map.entrySet()){
			Object value = ((Map.Entry)entry).getValue();
		    if((value instanceof String) && ((String)value).equals(id))
	            parentNode = map;
	        else if(value instanceof HashMap)
	            findNodeRecursive((HashMap)value,id);
	        else if(value instanceof Object[])
	            for(int i=0; i<((Object[])value).length; i++)
	                findNodeRecursive( (HashMap)(((Object[])value)[i]) ,id);
		}
	}
	
	public Object[] concat(Object[] A, Object[] B) {
	   	Object[] C= new Object[A.length+B.length];
	   	System.arraycopy(A, 0, C, 0, A.length);
	   	System.arraycopy(B, 0, C, A.length, B.length);

	   	return C;
	}
	
	@Override
	public Object[] getLateJoinState() {
		String s = "[{\"topic\":\"coweb.state.set.foobar\",\"value\":{\"d\":"+JSON.toString(arr)+"}},{\"topic\":\"coweb.engine.state\",\"value\":[[[0,1],[0,1]],[],1,[0]]},{\"topic\":\"coweb.pause.state\",\"value\":[]}]";
		Object[] tmp = (Object[])JSON.parse(s);
		return tmp;
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
