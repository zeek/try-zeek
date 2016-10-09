all:
	make -C web-ui
	cp web-ui/build/*.* static/
	rsync -avP web-ui/build/static/ static/
	docker build -t broplatform/trybro ./

run: all
	docker run -v /brostuff:/brostuff -v /var/run/docker.sock:/var/run/docker.sock --volumes-from trybro_data --rm -t -i -p 80:80 broplatform/trybro
