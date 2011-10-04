/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/lang","../_base"], function(dojo,dlang,dxa){

	// window startup data
	dxa.plugins.idle = new (function(){
		this.addData = dojo.hitch(dxa, "addData", "idle");
		this.idleTime=dojo.config["idleTime"] || 60000;
		this.idle=true;

		this.setIdle = function(){
			this.addData("isIdle");
			this.idle=true;

		}

		dojo.addOnLoad(dojo.hitch(this, function(){
			var idleResets=["onmousemove","onkeydown","onclick","onscroll"];
			for (var i=0;i<idleResets.length;i++){
				dojo.connect(dojo.doc,idleResets[i],this, function(e){
					if (this.idle){
						this.idle=false;
						this.addData("isActive");
						this.idleTimer=setTimeout(dojo.hitch(this,"setIdle"), this.idleTime);
					}else{
						clearTimeout(this.idleTimer);
						this.idleTimer=setTimeout(dojo.hitch(this,"setIdle"), this.idleTime);
					}
				});
			}
		}));
	})();
	return dojox.analytics.plugins.idle;
});