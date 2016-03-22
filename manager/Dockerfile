# bro
#
# VERSION               0.3

FROM      ubuntu:trusty
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN rm /var/lib/apt/lists/*list -vf && apt-get update && apt-get dist-upgrade -yq #2016-02-16
RUN apt-get update && apt-get install -yq python-pip python-dev
RUN apt-get update && apt-get install -yq redis-server

RUN sed -i "s/daemonize yes/daemonize no/" /etc/redis/redis.conf

RUN apt-get update && apt-get install -yq nginx
RUN apt-get update && apt-get install -yq supervisor
RUN apt-get update && apt-get install -yq gearman-job-server

RUN mkdir -p /var/log/supervisor
RUN mkdir /brostuff

ADD requirements.txt requirements.txt
RUN pip install -r requirements.txt

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD nginx.config /etc/nginx/sites-enabled/default
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

ADD . /src
WORKDIR /src

RUN cd static/examples && ./pack.py

#Redirect log files
#
RUN ln -sf /dev/stdout /var/log/redis/redis-server.log
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE  80
CMD ["/usr/bin/supervisord"]
