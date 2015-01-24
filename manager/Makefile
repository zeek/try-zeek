all:
	cd static/examples && ./pack.py
	docker build -t trybro ./

run: all
	docker run -v /brostuff:/brostuff -v /var/run/docker.sock:/var/run/docker.sock --volumes-from trybro_data --rm -t -i -p 80:80 trybro
