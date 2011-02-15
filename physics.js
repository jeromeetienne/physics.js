/*!
 * Physics.js is a javascript physics engine
 * 
 * - It acts as a wrapper on top of box2d. the whole physic is the same
 * - it contains a plugin system
 * 
 * - built using turing.js chain tutorial http://dailyjs.com/2010/08/26/framework-part-27/
 * 
 *
 *
 * TODO
 * * TODO clean up with this file
 * * support plugin ?
 *   * to have world drawer
 *   * game loop
 *   * or basic object builder
 *   * look at how jquery does it
 *   * seems something good to have
 * * a class for actual Body and Shape and world
 *   * try to keep the same class builder as _createBaseDefClass
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
 * the wrapper on top of body+all joint are here
 * * TODO define all type of joint
 * * define a function which create a pjs joint class based box2djs class
 *   * do a instanceof and new
 * * using this function in toJoint()
 * * test this in index.html with the engine
 *   * first only the Joint
 *   * then the body
 *     * in jointDef.body(body1, body2) handle box2d body and pjs body
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

pjs._jointIClassNames	= [
	"b2DistanceJoint",
	"b2GearJoint",
	"b2MouseJoint",
	"b2PrismaticJoint",
	"b2PulleyJoint",
	"b2RevoluteJoint"
];

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Create a base class
*/
pjs._createBaseClass	= function(opts){
	// TODO to write
	var iClassName	= opts._iClassName;
	var className	= opts._className	|| (opts._iClassName.substr(2,1).toLowerCase() + opts._iClassName.substr(3));
	var attrInfos	= opts._attrInfos	|| console.assert(false);
	var attrOneFct	= opts._attrOneFct	|| console.assert(false);

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
			if(typeof param1 == "object"){
				console.assert(typeof param2 == "undefined")
				for(var key in param1){
					this.attr(key, param1[key]);
				}
				return this;
			}
			return this._attrOne(param1, param2);
		}
	}
	// set the caller-defined _attrOne()
	pjs[className].prototype['_attrOne']	= attrOneFct;
	
	// for each attribute, alias attrKey(val) to attr(key,val)
	Object.keys(attrInfos).forEach(function(key){
		pjs[className].prototype[key]	= function(val){
			return this._attrOne(key, val)
		};
	})

	// sanity check - opts.init function MUST be defined
	console.assert(typeof opts.init === "function")

	// copy bunch of copound helper (IIF key doesnt start with "_")
	for(var fctName in opts){
		if( fctName[0] === "_" )	continue;
		pjs[className].prototype[fctName]	= opts[fctName];
	}

	// magic line i dont understand
	pjs[className].prototype.init.prototype = pjs[className].fn = pjs[className].prototype;
}


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

pjs._objDefaultAttrInfos	= function(iClassName){
	var iClass	= pjs._global[iClassName].prototype;
	var attrInfos	= {};
	for(var key in iClass){
		if( typeof iClass[key] !== "function" )	continue;
		if( !key.match(/^Get/) && !key.match(/^Set/) )	continue;
		var attrName	= key.substr(3,1).toLowerCase() + key.substring(4)
		var access	= key.substr(0,3);
		//console.log("key", attrName, access)
		if( typeof attrInfos[attrName] === "undefined" ){
			attrInfos[attrName]	= "";
		}
		if( access === "Get" ){
			attrInfos[attrName]	+= "r";
		}else if( access === "Set" ){
			attrInfos[attrName]	+= "w";
		}else	console.assert(false);
	}
	return attrInfos;
}


pjs._objDefaultAttrOneFct	= function(key, val){
	var keyCapitalized	= key.substring(0,1).toUpperCase() + key.substring(1);
	// check that this key exist
	console.assert(typeof this._attrInfos[key] !== "undefined")
	// get the attrInfo
	var attrInfo	= this._attrInfos[key];
	// handle the getter case
	if(typeof val === 'undefined'){
		// check that permissions is ok
		console.assert(attrInfo.indexOf("r") != -1);
		// return the value using the Get* function
		return this._iClass["Get"+keyCapitalized]();
	}
	// handle the setter case
	// check that permissions is ok
	console.assert(attrInfo.indexOf("w") != -1);
	// set the value using the Set* function
	this._iClass["Set"+keyCapitalized](val);
	// return the object itself
	return this;
};

/**
 * Create a class for Definitions
*/
pjs._createObjClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts._attrInfos	= opts._attrInfos	|| pjs._objDefaultAttrInfos(iClassName);
	opts._attrOneFct= opts._attrOneFct	|| pjs._objDefaultAttrOneFct;
	opts.init	= opts.init		|| function(iClass){
		this._iClass	= iClass;
		return this;
	}
	return pjs._createBaseClass(opts)
}

pjs._createObjClass({
	_iClassName	: "b2Body"
})

/**
 * Create a class for Definitions
*/
pjs._createJointObjClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= opts.init		|| function(iClass){
		console.log("init iClassName", iClassName)
		console.assert(iClass instanceof pjs._global[iClassName])
		this._iClass	= iClass;
		return this;
	}
	return pjs._createObjClass(opts)
}

pjs._jointIClassNames.forEach(function(iClassName){
	pjs._createJointObjClass({
		_iClassName	: iClassName
	})	
})

pjs._createJointObj	= function(iClass){
	console.log("iClass", iClass)
	for(var i = 0; pjs._jointIClassNames.length;i++){
		var iClassName	= pjs._jointIClassNames[i];
		if( iClass instanceof pjs._global[iClassName] ){
			return pjs.revoluteJoint(iClass);
		}
	}
	console.assert(false);
	return undefined;
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

pjs._defDefaultAttrInfos	= function(iClassName){
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
	// check that this key exist
	console.assert(typeof this._attrInfos[key] !== "undefined")
	// get the attrInfo
	var attrInfo	= this._attrInfos[key];
	// handle the getter case
	if(typeof val === 'undefined'){
		// check that permissions is ok
		console.assert(attrInfo.indexOf("r") != -1);
		// return the value
		return this._iClass[key];
	}
	// handle the setter case
	// check that permissions is ok
	console.assert(attrInfo.indexOf("w") != -1);
	this._iClass[key]	= val;
	// return the object itself
	return this;
};


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Create a class for Definitions
*/
pjs._createBaseDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts._attrInfos	= opts._attrInfos	|| pjs._defDefaultAttrInfos(iClassName);
	opts._attrOneFct= opts._attrOneFct	|| pjs._defDefaultAttrOneFct;
	return pjs._createBaseClass(opts)
}

/**
 * Create a ShapeDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from pjs._createBaseDefClass
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
	return pjs._createBaseDefClass(opts)
}

/**
 * Create a JointDef Class
 *
 * - create the class itself, dont instanciate with the object of this class
 * - derived from pjs._createBaseDefClass
*/
pjs._createJointDefClass	= function(opts){
	var iClassName	= opts._iClassName;
	opts.init	= function(attrs){
		this._iClass	= new pjs._global[iClassName]();
		if( attrs )	this.attr(attrs);
		return this;		
	};
	opts.toJoint	= function(world){
		var joint	= world.CreateJoint(this._iClass);
		return pjs._createJointObj(joint)
	}
	return pjs._createBaseDefClass(opts)
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		Create Body Definition Classes					//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * create the bodyDef class
*/
pjs._createBaseDefClass({
	_iClassName	: "b2BodyDef",
	init		: function(shapeDef){
		this._iClass	= new b2BodyDef();
		this._iClass.AddShape(shapeDef);
		return this;
	},
	toBody		: function(world){
		return pjs.body( world.CreateBody(this._iClass) );
	},
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

pjs._createShapeDefClass({
	_iClassName	: "b2BoxDef",
	size		: function(w, h){		// FIXIT extends is a max radius, not a size
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
		if( body1 instanceof pjs.body )	body1	= body1.get();
		if( body2 instanceof pjs.body )	body2	= body2.get();
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
		if( body1 instanceof pjs.body )	body1	= body1.get();
		if( body2 instanceof pjs.body )	body2	= body2.get();
		this._iClass.body1	= body1;
		this._iClass.body2	= body2;
		return this;
	}
})
