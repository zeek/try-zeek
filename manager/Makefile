all:
	docker build -t broplatform/trybro ./

run: all
	docker run -v /brostuff:/brostuff -v /var/run/docker.sock:/var/run/docker.sock -v /srv/trybro_data:/var/lib/redis --rm -t -i -p 80:80 broplatform/trybro
