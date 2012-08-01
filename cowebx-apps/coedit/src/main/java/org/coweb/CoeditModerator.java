
package org.coweb;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

import jodd.lagarto.LagartoParser;
import jodd.lagarto.EmptyTagVisitor;

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

		m_stable = "";
		m_current = new StringBuilder();
		m_attendees = new HashMap();
		m_title = "Untitled Document";
	}

	/**
	  */
	public synchronized boolean onSync(Map<String, Object> data)
	{

		String topic = (String)data.get("channel");

		if (topic.indexOf("editorUpdate") >= 0)
			return this.editorUpdate(data);
		else if (topic.indexOf("attendeeListJoin") >= 0)
			return this.attendeeListJoin(data);
		else if (topic.indexOf("attendeeListName") >= 0)
			return this.attendeeListName(data);
		else if (topic.indexOf("attendeeListColor") >= 0)
			return this.attendeeListColor(data);
		else if (topic.indexOf("editorTitle") >= 0)
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
		String currentAsString = m_current.toString();
		if (isValid(currentAsString))
		{
			m_stable = currentAsString;
			System.out.println("Valid: " + m_current.toString());
		}
		else
		{
			System.out.println("Invalid: " + m_current.toString());
		}

		return true;
	}

	private boolean attendeeListJoin(Map<String, Object> data)
	{
    Map value = (Map)data.get("value");
    HashMap<String, Object> newUser = new HashMap<String, Object>();
    newUser.put("name", value.get("name"));
    newUser.put("color", value.get("color"));
    m_attendees.put(value.get("site"), newUser);
		return true;
	}

	private boolean attendeeListName(Map<String, Object> data)
	{
    Map value = (Map)data.get("value");
    Map user = (Map)m_attendees.get(value.get("site"));
    user.put("name", value.get("value"));
		return true;
	}

	private boolean attendeeListColor(Map<String, Object> data)
	{
    Map value = (Map)data.get("value");
    Map user = (Map)m_attendees.get(value.get("site"));
    user.put("color", value.get("color"));
		return true;
	}

	private boolean editorTitle(Map<String, Object> data)
	{
		m_title = (String)((Map)data.get("value")).get("title");
		return true;
	}

	private static boolean isValid(String s)
	{
		try
		{
			LagartoParser lp = new LagartoParser(s);
			ErrorTagVisitor tv = new ErrorTagVisitor();
			lp.parse(tv);
			return !tv.isError;
		}
		catch (Exception e)
		{
			return false;
		}
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
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("snapshot", m_stable);
		map.put("title", m_title);
		map.put("attendees", m_attendees);
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("mainEditor", map);
		return data;
	}
	
	private static class ErrorTagVisitor extends EmptyTagVisitor
	{
		public boolean isError;
		public ErrorTagVisitor()
		{
			isError = false;
		}
		public void error(String s)
		{
			System.out.println("error:"+s);
			isError = true;
		}
		public void text(String s)
		{
			System.out.println("Text:"+s);
		}
	}

}

