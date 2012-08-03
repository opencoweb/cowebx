
package org.coweb;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Semaphore;

import org.cometd.bayeux.Message;
import org.cometd.bayeux.server.ServerSession;

import jodd.lagarto.dom.LagartoDOMBuilder;
import jodd.lagarto.dom.Document;

import jodd.log.LogFactory;
import jodd.log.DummyLog;
import jodd.log.Log;

public class CoeditModerator extends DefaultSessionModerator
{

	static
	{
		LogFactory.setImplementation(new LogFactory()
		{
			public Log getLogger(String name)
			{
				return new DummyLog(name);
			}
		});
	};

	private static final long VALIDATE_TIMEOUT = 1000;
	private static final long MAX_REVISIONS = 100;

	/* m_stable is the most recent valid HTML string, m_current is the current
	   object state (which might not be valid as operations are performed). */
	private String m_stable;
	private StringBuilder m_current;

	long m_nextupdate;
	Semaphore m_sem; /* Even the linux kernel has actual mutex locks... */
	LinkedList<String> m_revisions;
	Timer m_timer;

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
		m_revisions = new LinkedList<String>();
		m_nextupdate = System.currentTimeMillis() + VALIDATE_TIMEOUT;
		m_sem = new Semaphore(1);
		m_timer = new Timer();
		m_timer.schedule(new TimerTask()
		{
			public void run()
			{
				CoeditModerator.this.updateStable();
			}
		}, 1000, 1000);
	}

	private synchronized void updateStable()
	{
		try
		{
			m_sem.acquire();
		}
		catch (InterruptedException ie)
		{
			return;
		}
		LinkedList<String> stack = m_revisions;
		m_revisions = new LinkedList<String>();
		m_sem.release();

		/* Work backwards through revision history to find a valid
		   revision. After, clear the list even if a valid revision isn't
		   found. */
		int i = 0;
		for (String rev: stack)
		{
			++i;
			if (isValid(rev))
			{
				m_stable = rev;
				break;
			}
		}
		System.out.printf("%d %d\n", i, stack.size());
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

		boolean shouldUpdate = false;
		try
		{
			m_sem.acquire();
		}
		catch (InterruptedException ie)
		{
			return true;
		}
		m_revisions.push(m_current.toString());
		if (m_revisions.size() > MAX_REVISIONS)
			shouldUpdate = true;
		m_sem.release();

		if (shouldUpdate)
			updateStable();
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
			Document doc = builder.parse(s);
			String result = doc.getInnerHtml();
			// Normalize...
			result = result.replaceAll("&#039;", "'");
			if (result.equals(s))
			{
				return true;
			}
			else
			{
				//System.out.println("x"+s+"x\nx"+result+"x");
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

	public Map<String, Object> getLateJoinState()
	{
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("snapshot", m_stable);
		map.put("title", m_title);
		map.put("attendees", m_attendees);
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("mainEditor", map);
		System.out.println(data);
		return data;
	}

}

