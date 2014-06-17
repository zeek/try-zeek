# bro
#
# VERSION               0.1

FROM      ubuntu
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update
RUN apt-get -y install build-essential git bison flex cmake swig libssl-dev libgeoip-dev libmagic-dev libpcap-dev python-dev libcurl4-openssl-dev

RUN git clone --recursive git://git.bro.org/bro

ADD buildbro ./buildbro

RUN ./buildbro v2.2 2.2
RUN ./buildbro v2.3 2.3

RUN ln -s /bro-2.3 /bro

ADD pcaps /pcaps
ADD runbro ./runbro
