
package org.coweb;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

import jodd.lagarto.dom.LagartoDOMBuilder;
import jodd.lagarto.dom.Document;

public class CoeditModerator extends DefaultSessionModerator
{

	/* m_stable is the most recent valid HTML string, m_current is the current
	   object state (which might not be valid as operations are performed). */
	private String m_stable;
	private StringBuilder m_current;

	//LinkedList<String> m_revisions;

	/* If parsing each sync is too expensive, what we can do is queue up
	   the past 100 versions of the document, for example, and work backwards
	   once the queue is full looking for a stable document (using a separate
	   thread). Any way that we can minimize the number of parses is good.
	 */

	private Map m_attendees;
	private String m_title;

	public CoeditModerator()
	{
		m_stable = "";
		m_current = new StringBuilder();
		m_attendees = new HashMap();
		m_title = "Untitled Document";
		//m_revisions = new LinkedList<String>();
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
		String val = (String)data.get("value");
		char value = 0;
		if (null != val)
			value = val.charAt(0);
		String type = (String)data.get("type");
		int pos = (Integer)data.get("position");

		if ("insert".equals(type))
		{
			m_current.insert(pos, value);
		}
		else if ("delete".equals(type))
		{
			m_current.deleteCharAt(pos);
		}
		else if ("update".equals(type))
		{
			m_current.setCharAt(pos, value);
		}
		String currentAsString = m_current.toString();
		if (isValid(currentAsString))
		{
			m_stable = currentAsString;
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
		/* Optimization: only do a parse when open and close tags match. */
		if (!tagsMatch(s))
		{
			return false;
		}
		try
		{
			LagartoDOMBuilder builder = new LagartoDOMBuilder();
			builder.setCollectErrors(true);
			Document doc = builder.parse(s);
			String result = doc.getInnerHtml();
			if (result.equals(s))
			{
				return true;
			}
			else
			{
				System.out.println("x"+s+"x\nx"+result+"x");
				return false;
			}
		}
		catch (Exception e)
		{
			return false;
		}
	}

	private static boolean tagsMatch(String s)
	{
		int begin = 0;
		int end = 0;
		for (int i = 0; i < s.length(); ++i) 
		{
			char ch = s.charAt(i);
			if ('<' == ch)
				++begin;
			else if ('>' == ch)
				++end;
		}
		return begin == end;
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

}

