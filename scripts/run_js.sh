#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. &> /dev/null && pwd )"

cd $rootdir/examples/web/js

if ! command -v yarn >/dev/null 2>&1 ; then
    echo "yarn is required to build the JS example"
    echo "Please install it with 'brew install yarn'"
    exit 1
fi

sdk_target="$rootdir/examples/web/js/shenai-sdk"

if [ ! -d "$sdk_target" ]; then
    echo "Shen.AI SDK not found - please place the Web SDK in $sdk_target"
    exit 1
fi

yarn install
yarn build
sleep 1 && open http://localhost:3000&
yarn start
