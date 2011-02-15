/**
 * loop over the world 
 *
 * - TODO make it cleaner
 * - TODO make this function a lot more parametrable
 * - TODO clean this function for slow computer aka what happen is rendering is too slow
 *   - howto http://gafferongames.com/game-physics/fix-your-timestep/ 
*/
pjs.worldloop	= {}

/**
 * * externalize the drawing function
 * * currently depends on easybox2d.world2canvas
*/
pjs.worldloop.basic	= function(world, ctx) {
	var stepping	= false;
	var timeStep	= 1.0/60;
	var iteration	= 1;
	
	world.Step(timeStep, iteration);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	pjs.world2canvas.drawWorld(world, ctx);
	
	setTimeout(function(){
		pjs.worldloop.basic(world, ctx)
	}, timeStep*1000);
}