#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"

prefix=""

if command -v fvm &> /dev/null
then
    echo "Using FVM"
    prefix="fvm"
fi

cd "$rootdir/examples/flutter/flutter_custom_ui"
$prefix flutter run "$@"
