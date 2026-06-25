#!/bin/bash

set -e

fail() {
    echo "$1" >&2
    exit "${2:-1}"
}

has_gradle_property() {
    local name="$1"
    shift
    for arg in "$@"; do
        if [[ "$arg" == "-P${name}="* ]]; then
            return 0
        fi
    done
    return 1
}

rootdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && cd .. && pwd )"
example_dir="$rootdir/examples/android/java-minimal"

if ! has_gradle_property "shenaiApiKey" "$@" && [ -z "${SHENAI_API_KEY:-}" ]; then
    fail "SHENAI_API_KEY is required. Pass -PshenaiApiKey=<your-api-key> or set SHENAI_API_KEY." 2
fi

if [ -z "${JAVA_HOME:-}" ] && [ -x "/usr/libexec/java_home" ]; then
    java17_home="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
    if [ -n "$java17_home" ]; then
        export JAVA_HOME="$java17_home"
    fi
fi

cd "$example_dir"

if [ -x "./gradlew" ]; then
    gradle_cmd=("./gradlew")
elif command -v gradle >/dev/null 2>&1 ; then
    gradle_cmd=("gradle")
else
    fail "Gradle is required to build the Android example." 3
fi

"${gradle_cmd[@]}" installDebug --info "$@"

if ! command -v adb >/dev/null 2>&1 ; then
    fail "adb is required to run the Android example." 4
fi

adb shell am start -n ai.mxlabs.sdk_android_minimal_example/.MainActivity
