FROM debian:buster-slim
EXPOSE 4730
RUN apt-get update && \
    apt-get -y install gearman-job-server && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    true
CMD gearmand
