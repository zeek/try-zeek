# bro
#
# VERSION               0.1

FROM      ubuntu
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update
RUN apt-get -y install python-pip

RUN apt-get -y install redis-server
RUN sed -i "s/daemonize yes/daemonize no/" /etc/redis/redis.conf

RUN apt-get -y install supervisor
RUN mkdir -p /var/log/supervisor
RUN mkdir /brostuff
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ADD . /src

WORKDIR /src
RUN pip install -r requirements.txt

EXPOSE  8000
CMD ["/usr/bin/supervisord"]
