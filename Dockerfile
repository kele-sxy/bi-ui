# FROM 10.12.0.78:5000/k8s/nginx:1.20
FROM nginx:1.20-alpine

EXPOSE 7200

ENV SERVER_PORT=7200

WORKDIR /

ADD docker-entrypoint.d /docker-entrypoint.d
ADD nginx.conf.tmpl /nginx.conf.tmpl

COPY dist /usr/share/nginx/html/
