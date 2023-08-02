FROM node:14.18.0-alpine3.14

WORKDIR /var/www/app

RUN apk add --no-cache bash
