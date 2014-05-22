# bro
#
# VERSION               0.1

FROM      ubuntu
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update
RUN apt-get -y install build-essential git bison flex cmake swig libssl-dev libgeoip-dev libmagic-dev libpcap-dev python-dev libcurl4-openssl-dev

RUN git clone --recursive git://git.bro.org/bro
RUN cd bro && ./configure --prefix=/bro && make && make install
