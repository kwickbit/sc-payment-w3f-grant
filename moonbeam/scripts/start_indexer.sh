#!/bin/bash
cd moonbeam-indexer
npm i
docker-compose up -d || true
sqd run . 
wait