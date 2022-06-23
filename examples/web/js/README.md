# Shen.AI SDK Javascript Web example

Basic Javascript web app showing Shen.AI SDK capabilities.

## How to run the app

To run the app you first need to download `shenai_sdk` package and put it in this directory. To activate Shen.AI SDK properly you need to use your own license key. Put it in initialization call inside `app.js`:
```js
shenai.initialize(API_KEY, USER_ID,...)
```
Now you can run the app using `yarn start`.

## Using the app

When the app is running you should see the measurement window and camera stream. Messages on the screen should give you instructions how to take your first measurement.

## Documentation

To understand better the integration with Shen.AI SDK, please see the [Web documentation](https://developer.shen.ai/platforms/web).