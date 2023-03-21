#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. &> /dev/null && pwd )"

cd $rootdir/playground

if ! command -v pnpm >/dev/null 2>&1 ; then
    echo "pnpm is required to build the Shen.AI SDK Playground"
    echo "Please install it with 'brew install pnpm'"
    exit 1
fi

sdk_target="$rootdir/playground/shenai-sdk/"

if [ ! -d "$sdk_target" ]; then
    echo "Shen.AI SDK not found - please place the Web SDK in $sdk_target"
    exit 1
fi

pnpm install
pnpm add shenai-sdk --force
(sleep 1 && open http://localhost:3000)&
pnpm dev
