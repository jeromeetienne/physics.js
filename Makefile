# mini Makefile to automatize tasks

help:
	@echo "$$ make deploy"
	@echo "\tDeploy the application"
	@echo "$$ make help"
	@echo "\tDisplay inline help"

deploy	: deployGhPage

deployGhPage:
	rm -rf /tmp/physics.jsGhPages
	(cd /tmp && git clone git@github.com:jeromeetienne/physics.js.git physics.jsGhPages)
	(cd /tmp/physics.jsGhPages && git checkout gh-pages)
	cp -a * /tmp/physics.jsGhPages
	(cd /tmp/physics.jsGhPages && git add . && git commit -a -m "Another deployement" && git push origin gh-pages)
	#rm -rf /tmp/physics.jsGhPages

docs:
	dox --ribbon "http://github.com/jeromeetienne/physics.js"	\
		--title "Physics.js"					\
		--desc "Physics engine in js - chained API (ala jQuery) on top of Box2d"	\
		physics.js plugins/*.js > doc/physicsjs.html