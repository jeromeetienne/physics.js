# mini Makefile to automatize tasks

help:
	@echo "$$ make deploy"
	@echo "\tDeploy the application on google AppEngine"
	@echo "$$ make help"
	@echo "\tDisplay inline help"

deploy	: deployGhPage

deployGhPage:
	rm -rf /tmp/html5-buggyGhPages
	(cd /tmp && git clone git@github.com:jeromeetienne/html5-buggy.git html5-buggyGhPages)
	(cd /tmp/html5-buggyGhPages && git checkout gh-pages)
	cp -a * /tmp/html5-buggyGhPages
	(cd /tmp/html5-buggyGhPages && git add . && git commit -a -m "Another deployement" && git push origin gh-pages)
	#rm -rf /tmp/html5-buggyGhPages

docs:
	dox --ribbon "http://github.com/jeromeetienne/EasyBox2djs"	\
		--title "Easy Box2djs"					\
		--desc "Easy API on top of Box2djs"			\
		easyBox2djs.js > easyBox2djs.html