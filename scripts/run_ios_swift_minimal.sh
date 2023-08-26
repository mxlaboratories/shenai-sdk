#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"

cd $rootdir/examples/ios/shenai-swift-example

sdk_target="$rootdir/examples/ios/shenai-swift-example/ShenaiSDK.framework/"

if [ ! -d "$sdk_target" ]; then
    echo "Shen.AI SDK not found - please place the iOS SDK in $sdk_target"
    exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1 ; then
    echo "xcodebuild is required to build the iOS example"
    echo "Please install it with 'xcode-select --install'"
    exit 1
fi

echo "Building iOS example..."
xcodebuild -sdk iphoneos -scheme shenai-swift-example -derivedDataPath $rootdir/build/shenai-swift-example/

cd $rootdir/build/shenai-swift-example/Build/Products/Debug-iphoneos/

if ! command -v ios-deploy >/dev/null 2>&1 ; then
    echo "ios-deploy is required to run the iOS example from command line"
    echo "Please install it with 'brew install ios-deploy'"
    exit 1
fi

echo "Installing and launching the app..."
ios-deploy --debug --bundle shenai-swift-example.app