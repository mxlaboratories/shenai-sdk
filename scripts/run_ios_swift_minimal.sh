#!/bin/bash

set -e

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"
example_dir="$rootdir/examples/ios/ios-swift-minimal"
project="$example_dir/ios-swift-minimal.xcodeproj"
scheme="ios-swift-minimal"
derived_data="$rootdir/build/ios-swift-minimal"

if ! command -v xcodebuild >/dev/null 2>&1 ; then
    echo "xcodebuild is required to build the iOS example"
    echo "Please install it with 'xcode-select --install'"
    exit 1
fi

if [ -z "${SHENAI_API_KEY:-}" ]; then
    echo "SHENAI_API_KEY is required. Run with SHENAI_API_KEY=<your-api-key>."
    exit 2
fi

echo "Building iOS example..."
xcodebuild -project "$project" -scheme "$scheme" -resolvePackageDependencies SHENAI_API_KEY="$SHENAI_API_KEY"
xcodebuild -project "$project" -sdk iphoneos -scheme "$scheme" -derivedDataPath "$derived_data" SHENAI_API_KEY="$SHENAI_API_KEY"

cd "$derived_data/Build/Products/Debug-iphoneos/"

if ! command -v ios-deploy >/dev/null 2>&1 ; then
    echo "ios-deploy is required to run the iOS example from command line"
    echo "Please install it with 'brew install ios-deploy'"
    exit 1
fi

echo "Installing and launching the app..."
ios-deploy --debug --bundle "$scheme.app"
