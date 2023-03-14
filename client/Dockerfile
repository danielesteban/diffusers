FROM nginx:stable

RUN apt-get update && \
    apt-get -y install moreutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY 00-replace.sh /docker-entrypoint.d
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
