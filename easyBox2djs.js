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
 * * for shapeDefinition
 *   * support eb2.boxDef({attr1: val1})
 *   * support .toBodyDef({attr1: val1})
 * * a class for actual Body and Shape
 * * add the draw world in canvas
 * * add a basic game loop
 * * add a way to know the attribute by API
 *   * this is a nice as kinda documentation
 *   * so it goes in the easy part
 * * DONE createBaseDefClass
 *   * do a createShapeDefClass
 *   * do a createJointDefClass
 *   * remove the .init from createBaseDefClass
 * * take various simple cases
 *   * code them and use dox to generate the tutorial
 *   * part of the easy
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

/**
 * Create a class for Definitions
*/
eb2._createDefClass	= function(opts){
	// TODO to write
	var iClassName	= opts._iClassName;
	var className	= opts._className	|| (opts._iClassName.substr(2,1).toLowerCase() + opts._iClassName.substr(3));
	var attrNames	= opts._attrNames	|| eb2._guessAttrNames(iClassName);

	console.assert(typeof opts.init === "function")

	// ctor
	// TODO what is the purpose of this .fn ?
	eb2[className]	= function(ctorDef) {
		return new eb2[className].fn.init(ctorDef);
	}
	eb2[className].prototype	= {
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
		}
	}
	// for each attribute, alias attrKey(val) to attr(key,val)
	attrNames.forEach(function(key){
		eb2[className].prototype[key]	= function(val){
			//console.log("attr helper", key, val)
			return this.attr(key, val)
		};
	})

	// TODO copy bunch of copound helper
	for(var fctName in opts){
		if( fctName[0] === "_" )	continue;
		eb2[className].prototype[fctName]	= opts[fctName];
	}

	// magic line i dont understand
	eb2[className].prototype.init.prototype = eb2[className].fn = eb2[className].prototype;
}

/**
 * Create a ShapeDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from eb2._createDefClass
*/
eb2._createShapeDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= function(attrs){
		this._iClass	= new eb2._global[iClassName]();
		if( attrs )	this.attr(attrs);
		return this;		
	};
	opts.toBodyDef	= function(attrs){
		var bodyDef	= eb2.bodyDef(this._iClass)
		if( attrs )	bodyDef.attr(attrs);
		return bodyDef;
	};
	return eb2._createDefClass(opts)
}

/**
 * Create a JointDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from eb2._createDefClass
*/
eb2._createJointDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= function(attrs){
		this._iClass	= new eb2._global[iClassName]();
		if( attrs )	this.attr(attrs);
		return this;		
	};
	opts.toJoint	= function(world){
		return world.CreateJoint(this._iClass);
	}
	return eb2._createDefClass(opts)
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Body Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * create the bodyDef class
*/
eb2._createDefClass({
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
//		Create Shape Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * create all the Shape Definition class
*/

eb2._createShapeDefClass({
	_iClassName	: "b2BoxDef",
	size		: function(w, h){		// FIXIT extends is a max radius, not a size
		console.assert(typeof w !== "undefined");
		console.assert(typeof h !== "undefined");
		this._iClass.extents.Set(w, h);
		return this;
	}
});

eb2._createShapeDefClass({
	_iClassName	: "b2CircleDef"
});

eb2._createShapeDefClass({
	_iClassName	: "b2PolyDef"
});


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Joint Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

eb2._createJointDefClass({
	_iClassName	: "b2DistanceJointDef"
})

eb2._createJointDefClass({
	_iClassName	: "b2GearJointDef"
})

eb2._createJointDefClass({
	_iClassName	: "b2MouseJointDef"
})

eb2._createJointDefClass({
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

eb2._createJointDefClass({
	_iClassName	: "b2PulleyJointDef"
})

eb2._createJointDefClass({
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
