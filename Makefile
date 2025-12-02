build:
	docker compose build

run:
	#Use non-redirecting caddy config during development
	CADDY=notls docker compose build proxy
	CADDY=notls docker compose up -d
	docker compose logs -f

run-prod: build
	TRYZEEK_DATA=/srv/trybro_data docker compose up -d --scale worker=4
	docker compose logs -f
