/**
 * Chainable API on top of box2djs
 * - built using turing.js chain tutorial http://dailyjs.com/2010/08/26/framework-part-27/
 * initial stuff
 * var slota	= eb2BoxDef().density(0.5).restitution(0).friction(1.0).size(50, 10).toBody().position(800, 30).toWorld(world)
*/

//eb2Box().density(0.5).restitution(0).friction(1.0).toBody().position(80, 30).get()
//eb2Box().attr({

//////////////////////////////////////////////////////////////////////////////////
//		eb2BoxDef							//
//////////////////////////////////////////////////////////////////////////////////

function eb2BoxDef(ctorDef) {
	return new eb2BoxDef.fn.init(ctorDef);
}

eb2BoxDef.fn = eb2BoxDef.prototype = {
	init		: function(ctorDef){
		this._shapeDef	= ctorDef ? ctorDef : new b2BoxDef();
		this._bindAttrs();
		return this;
	},
	get		: function(){
		return this._shapeDef;
	},
	toBody		: function(){
		return eb2BodyDef(this._shapeDef)
	},
	size		: function(w, h){
		this._shapeDef.extents.Set(w, h);
		return this;
	},
	_bindAttrs	: function(){
		var self	= this;
		var attrFunction= function(obj, key){
			return function(val){
				if(typeof val == "undefined")	return obj[key];
				obj[key]	 = val;
				return self;
			}
		}
		var allAttrs	= ['density', 'restitution', 'friction'];
		for(var i = 0 ; i < allAttrs.length; i++){
			this[allAttrs[i]]	= attrFunction(this._shapeDef, allAttrs[i])
		}
	}
};

eb2BoxDef.fn.init.prototype = eb2BoxDef.fn;


//////////////////////////////////////////////////////////////////////////////////
//		eb2BodyDef							//
//////////////////////////////////////////////////////////////////////////////////

function eb2BodyDef(ctorDef) {
	return new eb2BodyDef.fn.init(ctorDef);
}

eb2BodyDef.fn = eb2BodyDef.prototype = {
	init		: function(shapeDef){
		this._bodyDef	= new b2BodyDef();
		this._bodyDef.AddShape(shapeDef);
		return this;
	},
	get		: function(){
		return this._bodyDef;
	},
	toWorld		: function(world){
		return world.CreateBody(this._bodyDef);
	},
	position	: function(x, y){
		this._bodyDef.position.Set(x, y);
		return this;
	}
};

eb2BodyDef.fn.init.prototype = eb2BodyDef.fn;
