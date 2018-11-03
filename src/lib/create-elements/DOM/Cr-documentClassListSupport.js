"use strict";

var y = true;
var inlineSlashifiable = {'hr':y,'br':y,'link':y,'meta':y,'input':y};

var __newParent = function(ownerNode, c){
	if( c.parentNode ) c.parentNode.removeChild(c);
	c.parentNode = ownerNode;
}

var __addNode = function(ownerNode, c){
	__newParent(ownerNode, c);
	ownerNode.childNodes.push(c);
}

var Cr_fragment = function(ownerNode){
	this.nodeType = 11; // could define getter only
	ownerNode = ownerNode || this; // owner node should basically never be provided except for internal usage... once the fragment is inserted however, each elements parent node could be updated
	this.childNodes = [];
	this.parentNode = false;

	this.appendChild = function(c){
		// c is suppose to be a node, but it could be a fragment too... since fragments render like regular HTML its not really distinguishable server side
		// if c is a fragment.... we might do things a little differently
		// we could append each child node in that case... since each element in the fragment will have the wrong parentNode (fragment itself)

		// if( c.nodeType==11 ){ // more document like
		// 	while( c.childNodes.length ){
		// 		this.__addNode(ownerNode, c.childNodes[0]);
		// 	}
		// }else{
		// 	this.__addNode(ownerNode, c);
		// }
		// return c;

		// ideally if c is a fragment, we might just append the whole fragment as a single child node still
		// what we have now works, but traversing the hierarchy that contains fragments will not work exactly the way you would expect it to work client side (see above) at this time, since each fragment is "one node".
		__addNode(ownerNode, c);
		return c; // "penalty of removal free"
	};

	this.insertBefore = function(c,b){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === b ){
				__newParent(ownerNode, c);
				this.childNodes.splice(n, 0, c);
				return c;
			}
		}
	};

	this.removeChild = function(c){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === c ){
				return this.childNodes.splice(n, 1);
			}
		}
	};

	this.cache = function(){
		// not standard dom, caches element to html representation (text node), prevents further manipulation
		return new Cr_text(this.__outerHTML());
	};

	this.__outerHTML = function(){
		return this.__innerHTML();
	};

	this.__innerHTML = function(){
		var childHtml = '';
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			childHtml+=this.childNodes[n].__outerHTML(); // could call outerHTML() here, we don't for quickness
		}
		return childHtml;
	};

	this.__empty = function(){
		while(this.lastChild) this.removeChild(this.lastChild);
	};

	Object.defineProperty(this, "lastChild",{
		get: function() {
			return this.childNodes[this.childNodes.length-1];
		}
	});

	Object.defineProperty(this, "nodeValue",{
		get: this.__innerHTML
	});

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "innerHTML",{
		get: this.__innerHTML,
		set: function(t){
			this.__empty();
			this.appendChild(new Cr_text(t));
		}
	});

};


var Cr_element = function(n){
	this.localName = n;
	this.nodeType = 1; // could define getter only
	this.__fragment = new Cr_fragment(this); // the fragment contains all the child nodes... several node properties exist on the fragment for convenience
	this.childNodes = this.__fragment.childNodes;
	this.parentNode = this.__fragment.parentNode;
	this.attributes = {};

	this.__cachedAttributes = ""; // you know its going to happen

	this.setAttribute = function(key, val){
		this.attributes[key] = val;
	};

	this.getAttribute = function(key){
		return this.attributes[key];
	};

	this.addEventListener = function(event, listener, captrue){
//http://stackoverflow.com/questions/18002799/running-multiple-files-on-node-js-at-the-same-time
//http://nodejs.org/api/modules.html

		// current thinking is this may operate in different configurable modes.
		// the default mode right now tries to use legacy onEVENT attributes and the event keyword present there
		// to trigger the event function in a way that is compatible with addEventListener, where the
		// first argument passed to the listener is the event

		var isAttrEvent = event.substr(0,2) == 'on'; // seems improper to ever provide events:['onclick',fn] due to client side incompatibility
		// if that's ever really needed, it should probably be set as a regular attribute not a special event/s attribute
		var onEvent = isAttrEvent ? event : 'on'+event;

		//TO IMPLEMENT - two modes?
		if( typeof(listener) == 'string'){ // server side only convention... not compatible with Cr client side... so not really useful,however json format event lister is string only...and needs work...
			if( isAttrEvent ){
				//embed in document onevent="listener"
			}else{
				// embed in client side JS attach listener?? 
			}
		}else{
			// assume function exist server side and client side?
			// server side any object with name property will do, need not be function server side to work
			// var myListener = {name: "myListener"};
			// Cr.evt('click', myListener) found in event/s attribute
			// results in attribute onclick="myListener(event)"
			if( listener.name ){ // named function

				this.setAttribute(onEvent, listener.name+'(event);');

			}else{
				// annon function / unnamed (var) function

				var listenerStr = listener.toString();

				// strategy
				// 1) escape all single quotes found within NON ESCAPED double quotes
				// 2) turn all double quotes into single quotes

				if( listenerStr.indexOf('"') > -1  ){
					//console.error("Whoah there Neo, that anonymous or unnamed function can't be an onEVENT because it contains doublequotes.  You provided:\n\n" + listenerStr)
					//return;

					// even though the strategy does not necessarily result in functional javascript...
					// it still results in a sound dom hierarchy so we use it anyway for now (if we don't return above)
					var quoParts = listenerStr.split('"');
					for( var q = 1, l=quoParts.length; q<l; q+=2){
						quoParts[q] = quoParts[q].replace(/'/g,"\\'");
						if( quoParts[q].match(/\\$/) ){ // the double quote we are within is not truly terminated since it ends with an escape
							q -= 1; continue; // move back by one so that we advance by one instead of two
						}
					}
					listenerStr = quoParts.join("'");
				}

				this.setAttribute(onEvent, '('+listenerStr+')(event);');
			}
		}
	};

	this.appendChild = this.__fragment.appendChild;

	this.insertBefore = this.__fragment.insertBefore;

	this.removeChild = this.__fragment.removeChild;

	this.__innerHTML = this.__fragment.__innerHTML;

	this.__empty = this.__fragment.__empty;

	this.cache = this.__fragment.cache;

	this.__canInlineSlashify = function(){
		return inlineSlashifiable[this.localName];
	};

	this.__attribHTML = function(){
		var o = [];
		for( var k in this.attributes ){
			o.push(k+'="'+this.attributes[k]+'"');
		}
		if( o.length ) return ' '+o.join(' ');
		return '';
	};

	this.__outerHTML = function(){
		var insideHtml = this.__innerHTML();
		if( !insideHtml.length && this.__canInlineSlashify() ){
			return '<' + this.localName + this.__attribHTML() + '/>';
		}
		return '<' + this.localName + this.__attribHTML() + '>' + insideHtml + '</' + this.localName + '>';
	};

	Object.defineProperty(this, "lastChild", Object.getOwnPropertyDescriptor(this.__fragment, 'lastChild'));

	Object.defineProperty(this, "nodeValue", Object.getOwnPropertyDescriptor(this.__fragment, 'nodeValue'));


	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "innerHTML", Object.getOwnPropertyDescriptor(this.__fragment, 'innerHTML'));

//	this.classList; // /add/remove support https://github.com/GoogleChrome/chrome-app-samples/blob/master/samples/filesystem-access/js/dnd.js

	// this.classList = { // ugh totally non standard except add/remove except return value
	// 	elm:this,
	// 	add:function(newly){ // may actually need to be more array like
	// 		var classes = '';
	// 		if( classes = this.elm.attributes.class || this.elm.attributes.className ){
	// 			classes = classes.split(' ');
	// 			classes.push(newly);
	// 			this.elm.attributes.class = classes.join(' ');
	// 			return this;
	// 		}
	// 	},
	// 	remove:function(search){
	// 		var classes = '';
	// 		if( classes = this.elm.attributes.class || this.elm.attributes.className ){
	// 			classes = ' '+classes+' ';

	// 			//classes = classes.split(' '+search+' ').join(' ');

	// 			classes = classes.replace(new RegExp(' '+search+' ','g'), ' ');

	// 			this.elm.attributes.class = classes.trim();

	// 			return this;
	// 		}
	// 	},
	// 	_get: function(){
	// 		return (this.elm.attributes.class || this.elm.attributes.className || "").split(' ');
	// 	},
	// 	_set: function(classes){
	// 		this.elm.attributes.class = classes.join(' ');
	// 	}
	// };

	// Object.defineProperty(this, "classList",{
	// 	get: function(){
	// 		return (this.attributes.class || this.attributes.className || "").split(' ');
	// 	}
	// });


};

var Cr_text = function(t){
	this.text = t;
	this.nodeType = 3; // could define getter only

	this.__outerHTML = function(){
		return this.text;
	};

	this.__setText = function(t){ this.text=t; };

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML,
		set: this.__setText
	});

	Object.defineProperty(this, "innerHTML",{
		get: this.__outerHTML,
		set: this.__setText
	});

	Object.defineProperty(this, "nodeValue",{
		get: this.__outerHTML,
		set: this.__setText
	});
};


var Cr_document = function(){
	this.__doctype="<!DOCTYPE html>\n";
	this.nodeType = 9; // could define getter only
	this.createElement = function(n){
		return new Cr_element(n);
	};
	this.createTextNode = function(t){
		return new Cr_text(t);
	};
	this.createDocumentFragment = function(){
		return new Cr_fragment();
	};
	this.body = this.createElement('body');
	this.head = this.createElement('head');
	this.html = this.createElement('html');
	this.html.appendChild(this.head);
	this.html.appendChild(this.body);
	this.__outerHTML = function(){
		return this.__doctype+this.html.outerHTML;
	};
	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});
	Object.defineProperty(this, "doctype",{
		get: function(){return this.__doctype.replace(/\n$/,'');},
		set: function(t){this.__doctype=t?t+"\n":"";}
	});
};

module.exports = Cr_document;
