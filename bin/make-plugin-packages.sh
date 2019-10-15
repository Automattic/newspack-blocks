#!/usr/bin/env bash

BLOCKS_DIR=src/blocks
TARGET=assets/blocks

npm run clean
npm run build:webpack

rm -rf $TARGET
mkdir -p $TARGET

for dir in $BLOCKS_DIR/*; do
    if [ -d "${dir}" ]; then
        name=$(basename $dir)
        # Copy source
        cp -R $dir $TARGET/
        # Copy built assets
        mkdir -p $TARGET/$name/dist
        cp -R dist/$name/* $TARGET/$name/dist/
    fi
done
