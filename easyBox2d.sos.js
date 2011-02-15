/*!
 * Chainable API on top of box2djs
 * - built using turing.js chain tutorial http://dailyjs.com/2010/08/26/framework-part-27/
 *
 * * make a easybox
 *
 * TODO
 * * a class for actual Body and Shape and world
 *   * try to keep the same class builder as _createDefClass
 * * each class got
 *   * bunch of attributes (key, val) for iClass[key]	= val;
 *   * attr({key: val})
 *   * bunch of attribute helpers, aka method in name of the key
 *   * .get() return iClass
 *   * bunch of helpers which does more
 * * take various simple cases
 *   * code them and use dox to generate the tutorial
 *   * part of the easy
 * * DONE for shapeDefinition
 *   * support pjs.boxDef({attr1: val1})
 *   * support .toBodyDef({attr1: val1})
 * * DONE add the draw world in canvas
 *   * in easyBox2d-drawworld
 * * DONE add a basic game loop
 *   * in easyBox2d-drawworld
 * * add a way to know the attribute by API
 *   * this is a nice as kinda documentation
 *   * so it goes in the easy part
 * * DONE createBaseDefClass
 *   * do a createShapeDefClass
 *   * do a createJointDefClass
 *   * remove the .init from createBaseDefClass
*/


/**
 * Define global namespace
*/
var pjs	= {};

/**
 * discover global namespace. support browser+nodejs
*/
pjs._global	= typeof window !== "undefined" ? window :
			typeof global !== "undefined" ? global :
			console.assert(false);

/**
 * Guess the attributes name based on the iClassName definition
 * 
 * - instantiate iClass and get all properties which are not function
*/
pjs._guessDefAttrNames	= function(iClassName){
	var iClass	= new pjs._global[iClassName]()
	var attrs	= [];
	for(var key in iClass){
		var type	= typeof iClass[key];
		if( type === "function" )	continue;
		attrs.push(key)
	}
	return attrs;
}

/**
 * Guess the attributes name based on the iClassName definition
 * 
 * - instantiate iClass and get all properties which are not function
*/
pjs._guessDefAttrInfos	= function(iClassName){
	var iClass	= new pjs._global[iClassName]()
	var attrInfos	= {};
	for(var key in iClass){
		var type	= typeof iClass[key];
		if( type === "function" )	continue;
		attrInfos[key]	= "rw";
	}
	return attrInfos;
}

pjs._defDefaultAttrOneFct	= function(key, val){
	console.log("key", key, "val", val)
	if(typeof val === 'undefined'){
		return this._iClass[key];
	}
	this._iClass[key]	= val;
	return this;
};


/**
 * Create a class for Definitions
*/
pjs._createDefClass	= function(opts){
	// TODO to write
	var iClassName	= opts._iClassName;
	var className	= opts._className	|| (opts._iClassName.substr(2,1).toLowerCase() + opts._iClassName.substr(3));
	
	// specific to definition
	var attrNames	= opts._attrNames	|| pjs._guessDefAttrNames(iClassName);
	var attrInfos	= opts._attrInfos	|| pjs._guessDefAttrInfos(iClassName);
	var attrOneFct	= opts._attrOneFct	|| pjs._defDefaultAttrOneFct;


	// ctor
	// TODO what is the purpose of this .fn ?
	pjs[className]	= function(ctorDef) {
		return new pjs[className].fn.init(ctorDef);
	}
	pjs[className].prototype	= {
		// add some debug info in the .prototype
		_iClassName	: iClassName,
		_className	: className,
		_attrInfos	: attrInfos,
		get	: function(){
			return this._iClass;
		},
		attr	: function(param1, param2){
			if(typeof param1 === "object"){
				console.assert(typeof param2 === "undefined")
				for(var key in param1){
					this._attrOne(key, param1[key]);
				}
				return this;
			}
			return this._attrOne(param1, param2);
		}
	}
	// set the caller-defined _attrOne()
	pjs[className].prototype['_attrOne']	= attrOneFct;

// for Body/Joint there is a lot of param which are read only or write only
// - handle this and check
// on Body and Joint this is this._iClass["Get"+param1]()
// on Body and Joint this is this._iClass["Set"+param1]()


	// for each attribute, alias attrKey(val) to attr(key,val)
	for(var key in attrInfos){
		pjs[className].prototype[key]	= function(val){
			//console.log("attr helper", key, val)
			return this._attrOne(key, val)
		};
	}

	// sanity check - opts.init function MUST be defined
	console.assert(typeof opts.init === "function")

	// TODO copy bunch of copound helper
	for(var fctName in opts){
		if( fctName[0] === "_" )	continue;
		pjs[className].prototype[fctName]	= opts[fctName];
	}

	// magic line i dont understand
	pjs[className].prototype.init.prototype = pjs[className].fn = pjs[className].prototype;
}

/**
 * Create a ShapeDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from pjs._createDefClass
*/
pjs._createShapeDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= function(attrs){
		this._iClass	= new pjs._global[iClassName]();
		if( attrs )	this.attr(attrs);
		return this;		
	};
	opts.toBodyDef	= function(attrs){
		var bodyDef	= pjs.bodyDef(this._iClass)
		if( attrs )	bodyDef.attr(attrs);
		return bodyDef;
	};
	return pjs._createDefClass(opts)
}

/**
 * Create a JointDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from pjs._createDefClass
*/
pjs._createJointDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= function(attrs){
		this._iClass	= new pjs._global[iClassName]();
		if( attrs )	this.attr(attrs);
		return this;		
	};
	opts.toJoint	= function(world){
		return world.CreateJoint(this._iClass);
	}
	return pjs._createDefClass(opts)
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Shape Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * create all the Shape Definition class
*/

pjs._createShapeDefClass({
	_iClassName	: "b2BoxDef",
	size		: function(w, h){		// FIXIT extends is a max radius, not a size
							// so convert this function? or make an extends function ?
							// size() is clearer, but extents() is the normal one
		console.assert(typeof w !== "undefined");
		console.assert(typeof h !== "undefined");
		this._iClass.extents.Set(w, h);
		return this;
	}
});

pjs._createShapeDefClass({
	_iClassName	: "b2CircleDef"
});

pjs._createShapeDefClass({
	_iClassName	: "b2PolyDef"
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Body Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * create the bodyDef class
*/
pjs._createDefClass({
	_iClassName	: "b2BodyDef",
	init		: function(shapeDef){	// overwrite normal .init()
		this._iClass	= new b2BodyDef();
		this._iClass.AddShape(shapeDef);
		return this;
	},
	toBody		: function(world){	return world.CreateBody(this._iClass);	},
	position	: function(x, y){
		this._iClass.position.Set(x, y);
		return this;
	}
})

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Joint Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

pjs._createJointDefClass({
	_iClassName	: "b2DistanceJointDef"
})

pjs._createJointDefClass({
	_iClassName	: "b2GearJointDef"
})

pjs._createJointDefClass({
	_iClassName	: "b2MouseJointDef"
})

pjs._createJointDefClass({
	_iClassName	: "b2PrismaticJointDef",
	anchor		: function(x, y){
		console.assert(typeof x !== "undefined");
		console.assert(typeof y !== "undefined");
		this._iClass.anchorPoint.Set(x, y);
		return this;
	},
	axis		: function(x, y){
		console.assert(typeof x !== "undefined");
		console.assert(typeof y !== "undefined");
		this._iClass.axis.Set(x, y);
		return this;
	},
	translation	: function(lower, upper){
		console.assert(typeof lower !== "undefined");
		console.assert(typeof upper !== "undefined");
		this.attr('lowerTranslation', lower);
		this.attr('upperTranslation', upper);
		return this;
	},
	body		: function(body1, body2){
		console.assert(typeof body1 !== "undefined");
		console.assert(typeof body2 !== "undefined");
		this._iClass.body1	= body1;
		this._iClass.body2	= body2;
		return this;
	}
})

pjs._createJointDefClass({
	_iClassName	: "b2PulleyJointDef"
})

pjs._createJointDefClass({
	_iClassName	: "b2RevoluteJointDef",
	anchor		: function(x, y){
		console.assert(typeof x !== "undefined");
		console.assert(typeof y !== "undefined");
		this._iClass.anchorPoint.Set(x, y);
		return this;
	},
	body		: function(body1, body2){
		console.assert(typeof body1 !== "undefined");
		console.assert(typeof body2 !== "undefined");
		this._iClass.body1	= body1;
		this._iClass.body2	= body2;
		return this;
	}
})
