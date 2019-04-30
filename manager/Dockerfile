# tryzeek
#
# VERSION               0.3

FROM node as web-builder
ADD web-ui/package.json web-ui/
ADD web-ui/package-lock.json web-ui/
RUN cd web-ui && npm install
ADD web-ui web-ui
RUN make -C web-ui

FROM      ubuntu:xenial
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN rm /var/lib/apt/lists/*list -vf && apt-get update && apt-get dist-upgrade -yq #2019-04-30
RUN apt-get update && apt-get install -yq python-pip python-dev
RUN apt-get update && apt-get install -yq redis-server nginx supervisor gearman-job-server rsync

RUN sed -i "s/daemonize yes/daemonize no/" /etc/redis/redis.conf

RUN mkdir -p /var/log/supervisor
RUN mkdir /brostuff

ADD requirements.txt requirements.txt
RUN pip install -r requirements.txt

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD nginx.config /etc/nginx/sites-enabled/default
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

ADD . /src
WORKDIR /src

# Add the webpack output to the web root
COPY --from=web-builder web-ui/build/ web-ui-build
RUN cp web-ui-build/*.* static/
RUN rsync -avP web-ui-build/static/ static/


RUN cd static/examples && ./pack.py

#Redirect log files
#
RUN ln -sf /dev/stdout /var/log/redis/redis-server.log
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

VOLUME /var/lib/redis
EXPOSE  80
CMD ["/usr/bin/supervisord"]
