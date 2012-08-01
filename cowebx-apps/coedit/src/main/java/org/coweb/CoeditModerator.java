
package org.coweb;

import java.util.*;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

public class CoeditModerator extends DefaultSessionModerator
{

	/* m_stable is the most recent valid HTML string, m_current is the current
	   object state (which might not be valid as operations are performed). */
	private String m_stable;
	private StringBuilder m_current;

	private Map m_attendees;
	private String m_title;

	public CoeditModerator()
	{
		System.out.println("New moderator");
		m_stable = "";
		m_current = new StringBuilder();
		m_attendees = new HashMap();
		m_title = "Untitled Document";
	}

	/**
	  */
	public synchronized boolean onSync(Map<String, Object> data)
	{

		String topic = (String)data.get("topic");

		System.out.println(data);
		if ("editorUpdate".equals(topic))
			return this.editorUpdate(data);
		else if ("attendeeListJoin".equals(topic))
			return this.attendeeListJoin(data);
		else if ("attendeeListName".equals(topic))
			return this.attendeeListName(data);
		else if ("attendeeListColor".equals(topic))
			return this.attendeeListColor(data);
		else if ("editorTitle".equals(topic))
			return this.editorTitle(data);

		return false;
	}

	private boolean editorUpdate(Map<String, Object> data)
	{
		// Get the value of the sync and determine the op to perform on tree
		char value = ((String)data.get("value")).charAt(0);
		String type = (String)data.get("type");
		int pos = (Integer)data.get("position");

		if ("insert".equals(type))
		{
			m_current.insert(pos, value);
		}
		else if ("delete".equals("type"))
		{
			m_current.deleteCharAt(pos);
		}
		else if ("update".equals("type"))
		{
			m_current.setCharAt(pos, value);
		}
		if (isValid(m_current))
			m_stable = m_current.toString();

		return true;
	}

	private boolean attendeeListJoin(Map<String, Object> data)
	{
		return true;
	}

	private boolean attendeeListName(Map<String, Object> data)
	{
		return true;
	}

	private boolean attendeeListColor(Map<String, Object> data)
	{
		return true;
	}

	private boolean editorTitle(Map<String, Object> data)
	{
		m_title = (String)((Map)data.get("value")).get("title");
		return true;
	}

	private static boolean isValid(StringBuilder b)
	{
		return true;
	}
	
	/**
	  *
	  * Our application is relatively simple - we have one collaborative object (the phonebook)
	  * whose internal data is already in the expected format of other clients.
	  *
	  * If we had more collaborative items (perhaps a collaborative notepad), we would place those
	  * collaborative items' data into the HashMap, keyed on the collab ID.
	  *
	  * @return full application state
	  */
	public Map<String, Object> getLateJoinState()
	{
		HashMap map = new HashMap();
		map.put("snapshot", m_stable);
		map.put("title", m_title);
		System.out.println("getLateJoinState()\n\n\n"+map);
		return map;
	}
	
}

