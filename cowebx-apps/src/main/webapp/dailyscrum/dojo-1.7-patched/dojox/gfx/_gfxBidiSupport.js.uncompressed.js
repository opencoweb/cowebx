/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./utils", "./shape", "dojox/string/BidiEngine"], function(){
	dojo.getObject("dojox.gfx._gfxBidiSupport", true);
	var g = dojox.gfx;

	switch (g.renderer){
		case 'vml':
			g.isVml = true;
			break;
		case 'svg':
			g.isSvg = true;
			if(g.svg.useSvgWeb){
				g.isSvgWeb = true;
			}
			break;
		case 'silverlight':
			g.isSilverlight = true;
			break;
		case 'canvas':
			g.isCanvas = true;
			break;
	}

	var bidi_const = {
		LRM : '\u200E',
		LRE : '\u202A',
		PDF : '\u202C',
		RLM : '\u200f',
		RLE : '\u202B'
	};

	// the object that performs text transformations.
	var bidiEngine = new dojox.string.BidiEngine();

	dojo.extend(dojox.gfx.shape.Surface, {
		// textDir:
		//		Will be used as default for Text/TextPath/Group objects that created by this surface
		//		and textDir wasn't directly specified for them, though the bidi support was loaded.
		//		Can be setted in two ways:
		//			1. When the surface is created and textDir value passed to it as fourth 
		//			parameter.
		//			2. Using the setTextDir(String) function, when this function is used the value
		//			of textDir propogates to all of it's children and the children of children (for Groups) etc.
		textDir: "",

		setTextDir: function(newTextDir){
			// summary:
			//		Used for propogation and change of textDir.
			//		newTextDir will be forced as textDir for all of it's children (Group/Text/TextPath).
			setTextDir(this, newTextDir);
		},

		getTextDir: function(){
			return this.textDir;
		}
	});

	dojo.extend(dojox.gfx.Group, {                          
		// textDir:
		//		Will be used for inheritance, or as default for text objects
		//		that textDir wasn't directly specified for them but the bidi support was required.
		textDir: "",

		setTextDir: function(newTextDir){
			// summary:
			//		Used for propogation and change of textDir.
			//		newTextDir will be forced as textDir for all of it's children (Group/Text/TextPath).
			setTextDir(this, newTextDir);
		},

		getTextDir: function(){
			return this.textDir;
		}	
	});
	
	dojo.extend(dojox.gfx.Text, {  
		// summary:
		//		Overrides some of dojox.gfx.Text properties, and adds some 
		//		for bidi support.
		
		// textDir: String
		//		Used for displaying bidi scripts in right layout.
		//		Defines the base direction of text that displayed, can have 3 values:
		//			1. "ltr" - base direction is left to right.
		//			2. "rtl" - base direction is right to left.
		//			3. "auto" - base direction is contextual (defined by first strong character).
		textDir: "",

		formatText: function (/*String*/ text, /*String*/ textDir){
			// summary: 
			//		Applies the right transform on text, according to renderer.
			// text:	
			//		the string for manipulation, by default return value.
			// textDir:	
			//		Text direction.
			//		Can be:
			//			1. "ltr" - for left to right layout.
			//			2. "rtl" - for right to left layout
			//			3. "auto" - for contextual layout: the first strong letter decides the direction.	
			// discription:
			//		Finds the right transformation that should be applied on the text, according to renderer.
			//		Was tested in:
			//			Renderers (browser for testing): 
			//				canvas (FF, Chrome, Safari), 
			//				vml (IE), 
			//				svg (FF, Chrome, Safari, Opera), 
			//				silverlight (IE, Chrome, Safari, Opera), 
			//				svgWeb(FF, Chrome, Safari, Opera, IE).
			//			Browsers [browser version that was tested]: 
			//				IE [6,7,8], FF [3.6], 
			//				Chrome (latest for March 2011), 
			//				Safari [5.0.3], 
			//				Opera [11.01].

			if(textDir && text && text.length > 1){
			var sourceDir = "ltr", targetDir = textDir;

			if(targetDir == "auto"){
				//is auto by default
				if(dojox.gfx.isVml){
					return text;
				}
				targetDir = bidiEngine.checkContextual(text);
			}

			if(dojox.gfx.isVml){
				sourceDir = bidiEngine.checkContextual(text);
				if(targetDir != sourceDir){
					if(targetDir == "rtl"){
						return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text,"IRNNN","ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
					}else{
						return bidi_const.LRM + text;
					}
				}
				return text;
			}

			if(dojox.gfx.isSvgWeb){
				if(targetDir == "rtl"){
					return bidiEngine.bidiTransform(text,"IRNNN","ILNNN");
				}
				return text;
			}

			if(dojox.gfx.isSilverlight){
				return (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRNNN","VLYNN") : bidiEngine.bidiTransform(text,"ILNNN","VLYNN");
			}

			if(dojox.gfx.isCanvas){
				return (targetDir == "rtl") ? bidi_const.RLE + text + bidi_const.PDF : bidi_const.LRE + text + bidi_const.PDF;
			}

			if(dojox.gfx.isSvg){
				if(dojo.isFF){
					return (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRYNN","VLNNN") : bidiEngine.bidiTransform(text,"ILYNN","VLNNN");
				}
				if(dojo.isChrome || dojo.isSafari || dojo.isOpera){
					return bidi_const.LRM + (targetDir == "rtl" ? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
				}					
			}					
}
			return text;
		},	

		bidiPreprocess: function(newShape){     
			return newShape;
		}	
	});

	dojo.extend(dojox.gfx.TextPath, {          
			// textDir: String
			//		Used for displaying bidi scripts in right layout.
			//		Defines the base direction of text that displayed, can have 3 values:
			//			1. "ltr" - base direction is left to right.
			//			2. "rtl" - base direction is right to left.
			//			3. "auto" - base direction is contextual (defined by first strong character).
		textDir: "",

		formatText: function (text, textDir){
			// summary: 
			//		Applies the right transform on text, according to renderer.
			// text:	the string for manipulation, by default return value.
			// textDir:	text direction direction.
			//		Can be:
			//			1. "ltr" - for left to right layout.
			//			2. "rtl" - for right to left layout
			//			3. "auto" - for contextual layout: the first strong letter decides the direction.	
			// discription:
			//		Finds the right transformation that should be applied on the text, according to renderer.
			//		Was tested in:
			//			Renderers: 
			//				canvas (FF, Chrome, Safari), vml (IE), svg (FF, Chrome, Safari, Opera), silverlight (IE8), svgWeb(FF, Chrome, Safari, Opera, IE).
			//			Browsers: 
			//				IE [6,7,8], FF [3.6], Chrome (latest for February 2011), Safari [5.0.3], Opera [11.01].

			if(textDir && text && text.length > 1){
				var sourceDir = "ltr", targetDir = textDir;

				if(targetDir == "auto"){
					//is auto by default
					if(dojox.gfx.isVml){
						return text;
					}
					targetDir = bidiEngine.checkContextual(text);
				}

				if(dojox.gfx.isVml){
					sourceDir = bidiEngine.checkContextual(text);
					if(targetDir != sourceDir){
						if(targetDir == "rtl"){
							return !bidiEngine.hasBidiChar(text) ? bidiEngine.bidiTransform(text,"IRNNN","ILNNN") : bidi_const.RLM + bidi_const.RLM + text;
						}else{
							return bidi_const.LRM + text;
						}
					}
					return text;
				}
				if(dojox.gfx.isSvgWeb){
					if(targetDir == "rtl"){
						return bidiEngine.bidiTransform(text,"IRNNN","ILNNN");
					}
					return text;
				}
				//unlike the g.Text that is rendered in logical layout for Bidi scripts.
				//for g.TextPath in svg always visual -> bidi script is unreadable (except Opera).
				if(dojox.gfx.isSvg){
					if(dojo.isOpera){
						text = bidi_const.LRM + (targetDir == "rtl"? bidi_const.RLE : bidi_const.LRE) + text + bidi_const.PDF;
					}else{
						text = (targetDir == "rtl") ? bidiEngine.bidiTransform(text,"IRYNN","VLNNN") : bidiEngine.bidiTransform(text,"ILYNN","VLNNN");
					}
				}					
			}	
			return text;
		},
		bidiPreprocess: function(newText){
			if(newText && (typeof newText == "string")){
				this.origText = newText;
				newText = this.formatText(newText,this.textDir);
			}
			return newText;
		}
	});	
		
	var extendMethod = function(shape, method, before, after){
		// Some helper function. Used for extending metod of shape.
		// shape: Object
		//		The shape we overriding it's metod.
		// method: String
		//		The method that is extended, the original metod is called before or after
		//		functions that passed to extendMethod. 
		// before: function
		//		If defined this function will be executed before the original method.
		// after: function
		//		If defined this function will be executed after the original method.
		var old = shape.prototype[method];
		shape.prototype[method] = 
			function(){
				var rBefore;
				if (before){
					rBefore = before.apply(this, arguments);
				}
				var r = old.call(this, rBefore);
				if (after){
					r = after.call(this, r, arguments);
				}
				return r;
			};
	};

	var bidiPreprocess = function(newText){
		if (newText){  
			if (newText.textDir){
				newText.textDir = validateTextDir(newText.textDir);
			}
			if (newText.text && (newText.text instanceof Array)){
				newText.text = newText.text.join(",");
			}
		}
		if(newText && (newText.text != undefined || newText.textDir) && (this.textDir != newText.textDir || newText.text != this.origText)){
			// store the original text. 
			this.origText = (newText.text != undefined) ? newText.text : this.origText;
			if(newText.textDir){
				this.textDir = newText.textDir;
			}
			newText.text = this.formatText(this.origText,this.textDir);
		}
		return this.bidiPreprocess(newText);

	};

	// Istead of adding bidiPreprocess to all renders one by one
	// use the extendMethod, at first there's a need for bidi transformation 
	// on text then call to original setShape.
	extendMethod(dojox.gfx.Text,"setShape", bidiPreprocess, null);
	extendMethod(dojox.gfx.TextPath,"setText", bidiPreprocess, null);
	
	var restoreText = function(origObj){
		var obj = dojo.clone(origObj);
		if (obj && this.origText){
			obj.text = this.origText;
		}
		return obj;
	};

	// Istead of adding restoreText to all renders one by one
	// use the extendMethod, at first get the shape by calling the original getShape,
	// than resrore original text (without the text transformations).
	extendMethod(dojox.gfx.Text, "getShape", null, restoreText);
	extendMethod(dojox.gfx.TextPath, "getText", null, restoreText);

	var groupTextDir = function(group, args){
		var textDir;
		if (args && args[0]){
			textDir = validateTextDir(args[0]);
		}
		group.setTextDir(textDir ? textDir : this.textDir);
		return group;	// dojox.gfx.Group				
	};

	// In creation of Group there's a need to update it's textDir,
	// so instead of doing it in renders one by one (vml vs others)
	// use the extendMethod, at first the original createGroup is applied, the
	// groupTextDir which is setts Group's textDir as it's father's or if was defined
	// by user by this value.
	extendMethod(dojox.gfx.Surface, "createGroup", null, groupTextDir);
	extendMethod(dojox.gfx.Group, "createGroup", null, groupTextDir);

	var textDirPreprocess =  function(text){
		//  inherit from surface / group  if textDir is defined there
		if(text){
			var textDir = text.textDir ? validateTextDir(text.textDir) : this.textDir;
			if(textDir){
				text.textDir = textDir;
			}
		}
		return text;
	};

	// In creation there's a need to some preprocess,
	// so instead of doing it in renders one by one (vml vs others)
	// use the extendMethod, at first the textDirPreprocess function handles the input
	// then the original createXXXXXX is applied.
	extendMethod(dojox.gfx.Surface,"createText", textDirPreprocess, null);
	extendMethod(dojox.gfx.Surface,"createTextPath", textDirPreprocess, null);
	extendMethod(dojox.gfx.Group,"createText", textDirPreprocess, null);
	extendMethod(dojox.gfx.Group,"createTextPath", textDirPreprocess, null);

	dojox.gfx.createSurface = function(parentNode, width, height, textDir) {        
		var s = dojox.gfx[dojox.gfx.renderer].createSurface(parentNode, width, height);
		var tDir = validateTextDir(textDir);
		
		if(dojox.gfx.isSvgWeb){
			s.textDir = tDir ? tDir : dojo.style(dojo.byId(parentNode),"direction");
			return s;
		}
		// if textDir was defined use it, else get default value.
		//s.textDir = tDir ? tDir : dojo.style(s.rawNode,"direction");
		if(dojox.gfx.isVml || dojox.gfx.isSvg || dojox.gfx.isCanvas){
			s.textDir = tDir ? tDir : dojo.style(s.rawNode,"direction");
		}
		if(dojox.gfx.isSilverlight){
			// allow this once rawNode will be able for the silverlight
			//s.textDir = tDir ? tDir : dojo.style(s.rawNode,"direction");
			s.textDir = tDir ? tDir : dojo.style(s._nodes[1],"direction");
		}
		
		return s;
	};

	// some helper functions
	
	function setTextDir(/*Object*/ obj, /*String*/ newTextDir){
		var tDir = validateTextDir(newTextDir);
		if (tDir){
			dojox.gfx.utils.forEach(obj,function(e){
				if(e instanceof dojox.gfx.Surface || e instanceof dojox.gfx.Group){
					e.textDir = tDir;
				}		
				if(e instanceof dojox.gfx.Text){
					e.setShape({textDir: tDir});
				}
				if(e instanceof dojox.gfx.TextPath){
					e.setText({textDir: tDir})
				}
			}, obj);
		}
		return obj;
	}

	function validateTextDir(textDir){
		var validValues = ["ltr","rtl","auto"]; 
		if (textDir){
			textDir = textDir.toLowerCase();
			if (dojo.indexOf(validValues, textDir) < 0){
				return null;
			}
		}
		return textDir;
	}

	return g; // return gfx api augmented with bidi support	
});

