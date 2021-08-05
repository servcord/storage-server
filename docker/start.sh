#! /bin/sh
docker run -d --net campfire-network -p 8866:80 --name campfire-storage-server campfire/storage-server
