# Shen.AI SDK Android example

Basic Android app showing Shen.AI SDK capabilities.

## How to run the app

To compile and run the app you first need to download `shenai_sdk` and `shenai_sdk_android` .aar packages and put them inside `libs` directory. Then you can open this project in Android Studio. To activate Shen.AI SDK properly you need to use your own license key. Put it in initialization call inside `MainActivity.kt`:
```kotlin
var result = shenaiSDKHandler.initialize(YOUR_API_KEY, YOUR_USER_ID)
```
Now you can compile and run the app using Android Studio.

## Documentation

To understand better the integration with Shen.AI SDK, please see the [Android documentation](https://developer.shen.ai/platforms/android).