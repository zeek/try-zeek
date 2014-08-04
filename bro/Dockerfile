# bro
#
# VERSION               0.1

FROM      ubuntu
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update && echo 2014-06-17
RUN apt-get -y install build-essential git bison flex cmake swig libssl-dev libgeoip-dev libmagic-dev libpcap-dev python-dev libcurl4-openssl-dev wget

ADD buildbro ./buildbro
RUN ./buildbro 2.2 http://www.bro.org/downloads/archive/bro-2.2.tar.gz
RUN ./buildbro 2.3 http://www.bro.org/downloads/release/bro-2.3.tar.gz

RUN cd /tmp && git clone --recursive git://git.bro.org/bro
ADD gitbro ./gitbro
RUN ./gitbro f8bb17bcb8fad4ba46d68fc24416f3c8aa8233f6

RUN ln -s /bro-2.3 /bro

ADD getgeo.sh /getgeo.sh
RUN /getgeo.sh

ADD pcaps /pcaps
ADD runbro ./runbro
