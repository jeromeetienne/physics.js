/**
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
 *   * bunch of helpers which does more
*/

//eb2Box().density(0.5).restitution(0).friction(1.0).toBody().position(80, 30).get()
//eb2Box().attr({

var eb2	= {};

//////////////////////////////////////////////////////////////////////////////////
//		eb2BoxDef							//
//////////////////////////////////////////////////////////////////////////////////

eb2.boxDef	= function(ctorDef) {
	return new eb2.boxDef.fn.init(ctorDef);
}

eb2.boxDef.prototype = {
	init		: function(ctorDef){
		this._shapeDef	= ctorDef ? ctorDef : new b2BoxDef();
		this._attrs	= ['density', 'restitution', 'friction'];
		this._bindAttrHelpers();
		return this;
	},
	get		: function(){
		return this._shapeDef;
	},
	toBodyDef	: function(){
		return eb2.bodyDef(this._shapeDef)
	},
	size		: function(w, h){
		this._shapeDef.extents.Set(w, h);
		return this;
	},
	attr		: function(param1, param2){
		if(typeof param1 == "object"){
			console.assert(typeof param2 == "undefined")
			for(var key in param1){
				this.attr(key, param1[key]);
			}
			return this;
		}else if(typeof param2 == "undefined"){
			// getter key/param1
			return this._shapeDef[param1];
		}else {
			console.assert(typeof param2 != "undefined")
			// setter key/param1 val/param2
			this._shapeDef[param1]	= param2;
		}
		return this;
	},
	_bindAttrHelpers: function(){
		var self	= this;
		this._attrs.forEach(function(key){
			self[key]	= function(val){
				return self.attr(key, val)
			};
		})
	}
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
