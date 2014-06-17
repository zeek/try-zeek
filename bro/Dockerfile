# bro
#
# VERSION               0.1

FROM      ubuntu
MAINTAINER Justin Azoff <justin.azoff@gmail.com>

RUN apt-get update && echo 2014-06-17
RUN apt-get -y install build-essential git bison flex cmake swig libssl-dev libgeoip-dev libmagic-dev libpcap-dev python-dev libcurl4-openssl-dev wget

ADD buildbro ./buildbro
RUN ./buildbro 2.2
RUN ./buildbro 2.3

RUN cd /tmp && git clone --recursive git://git.bro.org/bro
ADD gitbro ./gitbro
RUN ./gitbro 5d7b3f850be483c99b6c123387798f408041d825

RUN ln -s /bro-2.3 /bro

ADD pcaps /pcaps
ADD runbro ./runbro
