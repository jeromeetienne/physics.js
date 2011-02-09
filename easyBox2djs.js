/*!
 * Chainable API on top of box2djs
 * - built using turing.js chain tutorial http://dailyjs.com/2010/08/26/framework-part-27/
 * initial stuff
 * var slota	= eb2BoxDef().density(0.5).restitution(0).friction(1.0).size(50, 10).toBody().position(800, 30).toWorld(world)
 *
 *
 * TODO
 * * each class got
 *   * bunch of attributes (key, val) for iClass[key]	= val;
 *   * attr({key: val})
 *   * bunch of attribute helpers, aka method in name of the key
 *   * .get() return iClass
 *   * bunch of helpers which does more
*/


/**
 * Define global namespace
*/
var eb2	= {};

/**
 * discover global namespace. support browser+nodejs
*/
eb2._global	= typeof window !== "undefined" ? window :
			typeof global !== "undefined" ? global :
			console.assert(false);

/**
 * Guess the attributes name based on the iClassName
 * 
 * - instantiate iClass and get all properties which are not function
*/
eb2._guessAttrNames	= function(iClassName){
	var iClass	= new eb2._global[iClassName]()
	var attrs	= [];
	for(var key in iClass){
		var type	= typeof iClass[key];
		if( type === "function" )	continue;
		attrs.push(key)
	}
	return attrs;
}

eb2._attrFunction	= function(param1, param2){
	if(typeof param1 == "object"){
		console.assert(typeof param2 == "undefined")
		for(var key in param1){
			this.attr(key, param1[key]);
		}
		return this;
	}else if(typeof param2 == "undefined"){
		// getter key/param1
		return this._iClass[param1];
	}else {
		console.assert(typeof param2 != "undefined")
		// setter key/param1 val/param2
		this._iClass[param1]	= param2;
	}
	return this;
}

eb2._bindAttrHelpers	= function(){
	// FIXIT is this self needed ???
	var self	= this;
	this._attrs.forEach(function(key){
		self[key]	= function(val){
			return self.attr(key, val)
		};
	})
}

eb2.getFunction	= function(){
	return this._iClass;
}

/**
 * Each object
*/
eb2._createClass	= function(opts){
	// TODO to write
	var className	= opts._className;
	var iClassName	= opts._iClassName;

	// ctor
	// TODO what is the purpose of this .fn ?
	eb2[className]	= function(ctorDef) {
		return new eb2[className].fn.init(ctorDef);
	}
	eb2[className].prototype	= {
		init		: function(ctorDef){
			this._iClass	= ctorDef ? ctorDef : new eb2._global[iClassName]();
			this._bindAttrHelpers()
			return this;
		},
		get	: function(){
			return this._iClass;
		},
		attr	: function(param1, param2){
			if(typeof param1 == "object"){
				console.assert(typeof param2 == "undefined")
				for(var key in param1){
					this.attr(key, param1[key]);
				}
				return this;
			}else if(typeof param2 == "undefined"){
				// getter key/param1
				return this._iClass[param1];
			}else {
				console.assert(typeof param2 != "undefined")
				// setter key/param1 val/param2
				this._iClass[param1]	= param2;
			}
			return this;
		},
		_bindAttrHelpers	: function(){
			// FIXIT is this self needed ???
			var self	= this;
			this._attrNames.forEach(function(key){
				self[key]	= function(val){
					return self.attr(key, val)
				};
			})
		}
	}
	// TODO copy bunch of copound helper
	for(var fctName in opts){
		if( fctName[0] === "_" )	continue;
		eb2[className].prototype[fctName]	= opts[fctName];
	}
	// magic line i dont understand
	eb2[className].prototype.init.prototype = eb2[className].fn = eb2[className].prototype;
}

// possible to guess _attrNames by inspecting a b2BoxDef
eb2._createClass({
	_className	: "boxDef",
	_iClassName	: "b2BoxDef",				// May be in createClass
	_attrNames	: eb2._guessAttrNames("b2BoxDef"),	// May be in createClass
	toBodyDef	: function(){	return eb2.bodyDef(this._iClass)	},
	size		: function(w, h){
		this._iClass.extents.Set(w, h);
		return this;
	}
});

eb2._createClass({
	_className	: "BodyDef",
	_iClassName	: "b2BodyDef",
	_attrNames	: eb2._guessAttrNames("b2BodyDef"),
	toBody		: function(world){	return world.CreateBody(this._iClass);	},
	position	: function(x, y){
		this._iClass.position.Set(x, y);
		return this;
	}
})

//////////////////////////////////////////////////////////////////////////////////
//		eb2BoxDef							//
//////////////////////////////////////////////////////////////////////////////////

eb2.boxDef	= function(ctorDef) {
	return new eb2.boxDef.fn.init(ctorDef);
}

eb2.boxDef.prototype = {
	init		: function(ctorDef){
		this._iClass	= ctorDef ? ctorDef : new b2BoxDef();
		this._attrs	= ['density', 'restitution', 'friction'];
		this._bindAttrHelpers();
		return this;
	},
	toBodyDef	: function(){
		return eb2.bodyDef(this._iClass)
	},
	size		: function(w, h){
		this._iClass.extents.Set(w, h);
		return this;
	},
	get		: eb2._getFunction,
	attr		: eb2._attrFunction,
	_bindAttrHelpers: eb2._bindAttrHelpers,
};

// magic line i dont understand
eb2.boxDef.prototype.init.prototype = eb2.boxDef.fn = eb2.boxDef.prototype;


//////////////////////////////////////////////////////////////////////////////////
//		eb2.bodyDef							//
//////////////////////////////////////////////////////////////////////////////////

eb2.bodyDef	= function(ctorDef) {
	return new eb2.bodyDef.fn.init(ctorDef);
}

eb2.bodyDef.fn = eb2.bodyDef.prototype = {
	init		: function(shapeDef){
		this._bodyDef	= new b2BodyDef();
		this._bodyDef.AddShape(shapeDef);
		return this;
	},
	get		: function(){
		return this._bodyDef;
	},
	toBody	: function(world){
		return world.CreateBody(this._bodyDef);
	},
	position	: function(x, y){
		this._bodyDef.position.Set(x, y);
		return this;
	}
};

eb2.bodyDef.fn.init.prototype = eb2.bodyDef.fn;
