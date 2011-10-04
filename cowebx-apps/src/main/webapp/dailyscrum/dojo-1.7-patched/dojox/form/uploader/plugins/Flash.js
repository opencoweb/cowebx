/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox/form/uploader/plugins/HTML5","dojox/embed/Flash"],function(_1){_1.declare("dojox.form.uploader.plugins.Flash",[],{swfPath:_1.config.uploaderPath||_1.moduleUrl("dojox.form","resources/uploader.swf"),skipServerCheck:true,serverTimeout:2000,isDebug:false,devMode:false,deferredUploading:0,force:"",postMixInProperties:function(){if(!this.supports("multiple")){this.uploadType="flash";this._files=[];this._fileMap={};this._createInput=this._createFlashUploader;this.getFileList=this.getFlashFileList;this.reset=this.flashReset;this.upload=this.uploadFlash;this.submit=this.submitFlash;this.fieldname="flashUploadFiles";}this.inherited(arguments);},onReady:function(_2){},onLoad:function(_3){},onFileChange:function(_4){},onFileProgress:function(_5){},getFlashFileList:function(){return this._files;},flashReset:function(){this.flashMovie.reset();this._files=[];},uploadFlash:function(){this.onBegin(this.getFileList());this.flashMovie.doUpload();},submitFlash:function(_6){this.onBegin(this.getFileList());this.flashMovie.doUpload(_6);},_change:function(_7){this._files=this._files.concat(_7);_1.forEach(_7,function(f){f.bytesLoaded=0;f.bytesTotal=f.size;this._fileMap[f.name+"_"+f.size]=f;},this);this.onChange(this._files);this.onFileChange(_7);},_complete:function(_8){var o=this._getCustomEvent();o.type="load";this.onComplete(_8);},_progress:function(f){this._fileMap[f.name+"_"+f.bytesTotal].bytesLoaded=f.bytesLoaded;var o=this._getCustomEvent();this.onFileProgress(f);this.onProgress(o);},_error:function(_9){this.onError(_9);},_onFlashBlur:function(_a){},_getCustomEvent:function(){var o={bytesLoaded:0,bytesTotal:0,type:"progress",timeStamp:new Date().getTime()};for(var nm in this._fileMap){o.bytesTotal+=this._fileMap[nm].bytesTotal;o.bytesLoaded+=this._fileMap[nm].bytesLoaded;}o.decimal=o.bytesLoaded/o.bytesTotal;o.percent=Math.ceil((o.bytesLoaded/o.bytesTotal)*100)+"%";return o;},_connectFlash:function(){this._subs=[];this._cons=[];var _b=_1.hitch(this,function(s,_c){this._subs.push(_1.subscribe(this.id+s,this,_c));});_b("/filesSelected","_change");_b("/filesUploaded","_complete");_b("/filesProgress","_progress");_b("/filesError","_error");_b("/filesCanceled","onCancel");_b("/stageBlur","_onFlashBlur");var cs=_1.hitch(this,function(s,nm){this._cons.push(_1.subscribe(this.id+s,this,function(_d){this.button._cssMouseEvent({type:nm});}));});cs("/up","mouseup");cs("/down","mousedown");cs("/over","mouseover");cs("/out","mouseout");this.connect(this.domNode,"focus",function(){this.flashMovie.focus();this.flashMovie.doFocus();});if(this.tabIndex>=0){_1.attr(this.domNode,"tabIndex",this.tabIndex);}},_createFlashUploader:function(){var _e=this.getUrl();if(_e){if(_e.toLowerCase().indexOf("http")<0&&_e.indexOf("/")!=0){var _f=window.location.href.split("/");_f.pop();_f=_f.join("/")+"/";_e=_f+_e;}}else{console.warn("Warning: no uploadUrl provided.");}this.inputNode=_1.create("div",{className:"dojoxFlashNode"},this.domNode,"first");_1.style(this.inputNode,{position:"absolute",top:"-2px",width:this.btnSize.w+"px",height:this.btnSize.h+"px",opacity:0});var w=this.btnSize.w;var h=this.btnSize.h;var _10={expressInstall:true,path:(this.swfPath.uri||this.swfPath)+"?cb_"+(new Date().getTime()),width:w,height:h,allowScriptAccess:"always",allowNetworking:"all",vars:{uploadDataFieldName:this.flashFieldName||this.name+"Flash",uploadUrl:_e,uploadOnSelect:this.uploadOnSelect,deferredUploading:this.deferredUploading||0,selectMultipleFiles:this.multiple,id:this.id,isDebug:this.isDebug,noReturnCheck:this.skipServerCheck,serverTimeout:this.serverTimeout},params:{scale:"noscale",wmode:"transparent",wmode:"opaque",allowScriptAccess:"always",allowNetworking:"all"}};this.flashObject=new dojox.embed.Flash(_10,this.inputNode);this.flashObject.onError=_1.hitch(function(msg){console.error("Flash Error: "+msg);});this.flashObject.onReady=_1.hitch(this,function(){this.onReady(this);});this.flashObject.onLoad=_1.hitch(this,function(mov){this.flashMovie=mov;this.flashReady=true;this.onLoad(this);});this._connectFlash();}});dojox.form.addUploaderPlugin(dojox.form.uploader.plugins.Flash);return dojox.form.uploader.plugins.Flash;});