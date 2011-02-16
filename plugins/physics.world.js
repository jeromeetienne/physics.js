/**
 * physics.js plugin to create world
 * 
*/


/**
 * Define the namespace
*/
console.assert(typeof pjs.world === "undefined");
pjs.world	= {};


pjs.world.create	= function(opts){
	var minVertex	= opts.minVertex	|| console.assert(false);
	var maxVertex	= opts.maxVertex	|| console.assert(false);
	var gravity	= opts.gravity		|| console.assert(false);
	var doSleep	= opts.doSleep		|| true;
	console.assert(typeof opts.minVertex === Array && opts.minVertex.length == 2)
	console.assert(typeof opts.maxVertex === Array && opts.maxVertex.length == 2)
	console.assert(typeof opts.gravity   === Array && opts.gravity.length == 2)
	
	var worldAABB	= new b2AABB();
	worldAABB.minVertex.Set(minVertex[0], minVertex[1]);
	worldAABB.maxVertex.Set(maxVertex[0], maxVertex[1]);
	
	var gravity	= new b2Vec2(gravity[0], gravity[1]);
	world		= new b2World(worldAABB, gravity, doSleep);
	
	return world;
}