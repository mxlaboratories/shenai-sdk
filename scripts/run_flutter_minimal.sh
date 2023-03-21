#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"

prefix=""

sdk_target="$rootdir/examples/flutter/flutter_minimal/shenai_sdk/"

if [ ! -d "$sdk_target" ]; then
    echo "Shen.ai SDK not found - please place the Flutter SDK in $sdk_target"
    exit 1
fi

if command -v fvm &> /dev/null
then
    echo "Using FVM"
    prefix="fvm"
fi

cd $rootdir/examples/flutter/flutter_minimal
$prefix flutter run
