/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(['doh', '../../crypto/Blowfish'], function(doh, Blowfish){
	var message="The rain in Spain falls mainly on the plain.";
	var key="foobar";
	var base64Encrypted="WI5J5BPPVBuiTniVcl7KlIyNMmCosmKTU6a/ueyQuoUXyC5dERzwwdzfFsiU4vBw";

	tests.register("dojox.encoding.crypto.tests.Blowfish", [
		function testEncrypt(t){
			var dt=new Date();
			t.assertEqual(base64Encrypted, Blowfish.encrypt(message, key));
			doh.debug("testEncrypt: ", new Date()-dt, "ms.");
		},
		function testDecrypt(t){
			var dt=new Date();
			t.assertEqual(message, Blowfish.decrypt(base64Encrypted, key));
			doh.debug("testDecrypt: ", new Date()-dt, "ms.");
		},
		function testShortMessage(t){
			var msg="pass";
			var pwd="foobar";
			var dt=new Date();
			var enc=Blowfish.encrypt(msg, pwd);
			var dec=Blowfish.decrypt(enc, pwd);
			t.assertEqual(dec, msg);
			doh.debug("testShortMessage: ", new Date()-dt, "ms.");
		}
	]);
});
