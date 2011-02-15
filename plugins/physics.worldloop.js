/**
 * physics.js plugin to loop over the world 
 *
*/

/**
 * Define the namespace
*/
console.assert(typeof pjs.worldloop === "undefined");
pjs.worldloop	= {}

/**
 * * externalize the drawing function
 * * currently depends on easybox2d.world2canvas
*/
pjs.worldloop.basicCanvas	= function(world, ctx) {
	pjs.worldloop.basic(world, function(world){
		pjs.world2canvas.drawWorld(world, ctx)
	});
}

/**
 *
 * - TODO make it cleaner
 * - TODO make this function a lot more parametrable
 * - TODO clean this function for slow computer aka what happen is rendering is too slow
 *   - howto http://gafferongames.com/game-physics/fix-your-timestep/
 *
 * @param {Function} RenderCb(world) will be called to render the world
*/
pjs.worldloop.basic	= function(world, renderCb) {
	var stepping	= false;
	var timeStep	= 1.0/60;
	var iteration	= 1;
	// go one step
	world.Step(timeStep, iteration);

	// render
	renderCb(world);
	
	// call itself 
	setTimeout(function(){
		pjs.worldloop.basic(world, renderCb)
	}, timeStep*1000);
}
