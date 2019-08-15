#!/usr/bin/env bash

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

if [[ "$#" -ne 2 ]]; then
    echo Usage is $0 [root] [target]
    exit
fi

ROOT=$1
TARGET=$2

# Create target dir
rm -rf ${TARGET}
mkdir -p ${TARGET}
chown silviu ${TARGET}

# Copy all files
rsync -a ${ROOT} ${TARGET}

# Go there and fix links
cd ${TARGET}

# Deploy static files
mkdir /var/www/html/play.oprea.ch/static/js/eagle
cp frontend/dist/js/dynamic_form_bundle.js /var/www/html/play.oprea.ch/static/js/eagle
cp frontend/dist/js/bundle.js /var/www/html/play.oprea.ch/static/js/eagle
cp frontend/dist/index.html /var/www/html/play.oprea.ch/static/index.html

pm2 delete eagle
pm2 start backend/src/eagle.js
