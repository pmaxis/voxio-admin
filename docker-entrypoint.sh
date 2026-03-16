#!/bin/sh
set -e
sed -e "s/__API_HOST__/${API_HOST}/g" -e "s/__API_PORT__/${API_PORT}/g" \
  /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
