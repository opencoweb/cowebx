/**
 * Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
 * Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
 */
package org.coweb.example;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.coweb.UpdaterTypeMatcher;

public class ExampleUpdaterTypeMatcher implements UpdaterTypeMatcher {
	private Map<String, List<String>> updaterTypeLookup = null;

	public ExampleUpdaterTypeMatcher() {
		updaterTypeLookup = new HashMap<String, List<String>>();
		updaterTypeLookup.put("type1", Arrays.asList(new String[]{"type1", "type3"}));
		updaterTypeLookup.put("type2", Arrays.asList(new String[]{"type2", "type4"}));
		updaterTypeLookup.put("type3", Arrays.asList(new String[]{"type3"}));
		updaterTypeLookup.put("type4", Arrays.asList(new String[]{"type4"}));
	}
	
	public String match(String updateeType, List<String> availableUpdaterTypes) {
		String match = null;
		for (String availableUpdaterType : availableUpdaterTypes) {
			List<String> matches = updaterTypeLookup.get(availableUpdaterType);
			if (matches != null && matches.contains(updateeType)) {
				match = availableUpdaterType;
				break;
			}
		}
		System.out.println("ExampleUpdaterTypeMatcher called to obtain a match for ["+updateeType+"] match = ["+match+"]");
		return match;
	}
}
