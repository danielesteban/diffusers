#!/usr/bin/sh
protoc --python_out=src --proto_path=../server/src ../server/src/messages.proto
