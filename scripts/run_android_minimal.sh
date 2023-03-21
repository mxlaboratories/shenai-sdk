#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"

mkdir -p $rootdir/examples/android/java-minimal/libs/

sdk_target="$rootdir/examples/android/java-minimal/libs/shenai_sdk.aar"

if [ ! -d "$sdk_target" ]; then
    echo "Shen.ai SDK not found - please place the SDK in $sdk_target"
    exit 1
fi

cd $rootdir/examples/android/java-minimal/

if ! command -v gradle >/dev/null 2>&1 ; then
    echo "gradle is required to build the Android example"
    exit 2
fi

gradle installDebug --info

if ! command -v adb >/dev/null 2>&1 ; then
    echo "adb is required to run the Android example"
    exit 3
fi

adb shell am start -n ai.mxlabs.sdk_android_minimal_example/.MainActivity