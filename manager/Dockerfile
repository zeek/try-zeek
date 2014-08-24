# bro
#
# VERSION               0.2

FROM      ubuntu:trusty
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update && apt-get install -yq python-pip python-dev
RUN apt-get update && apt-get install -yq redis-server

RUN sed -i "s/daemonize yes/daemonize no/" /etc/redis/redis.conf

RUN apt-get update && apt-get install -yq nginx
RUN apt-get update && apt-get install -yq supervisor

RUN mkdir -p /var/log/supervisor
RUN mkdir /brostuff

ADD requirements.txt requirements.txt
RUN pip install -r requirements.txt

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD nginx.config /etc/nginx/sites-enabled/default
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

ADD . /src
WORKDIR /src

EXPOSE  80
CMD ["/usr/bin/supervisord"]
