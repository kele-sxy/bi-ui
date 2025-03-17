#!/bin/sh

set -e

ME=$(basename $0)

[ -z "${SERVER_PORT}" ] && exit 1

echo >&3 "$ME: gen nginx.conf with SERVER_PORT: $SERVER_PORT"

defined_envs=$(printf '${%s} ' $(env | cut -d= -f1))
envsubst "$defined_envs" < "/nginx.conf.tmpl" > "/etc/nginx/nginx.conf"

exit 0
