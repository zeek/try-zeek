all:
	docker-compose build

run: all
	#Use non-redirecting caddy config during development
	CADDY=notls docker-compose build proxy
	CADDY=notls docker-compose up -d
	docker-compose logs -f
