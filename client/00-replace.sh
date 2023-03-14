#!/bin/sh
for file in /usr/share/nginx/html/*
do
sed -E \
"s@__CLIENT_BASENAME__@$CLIENT_BASENAME@g; s@__SERVER_URL__@$SERVER_URL@g" \
< "$file" | sponge "$file"
done
