PWD := $(shell pwd)
all:
	docker build -t broplatform/trybro ./

run: all
	docker run -v /brostuff:/brostuff -v /var/run/docker.sock:/var/run/docker.sock -v /srv/trybro_data:/var/lib/redis -v /certs:/root/certs --rm -t -i -p 80:80 -p 443:443 broplatform/trybro

test_local: all
	echo "PWD = " $(PWD)
	docker run -v $(PWD)/brostuff:/brostuff -v /var/run/docker.sock:/var/run/docker.sock -v $(PWD)/trybro_data:/var/lib/redis -v $(PWD)/certs:/root/certs --rm -t -i -p 80:80 -p 443:443 broplatform/trybro
