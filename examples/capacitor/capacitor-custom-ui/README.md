# Shen.AI Capacitor Custom UI

Nonchromatic custom UI example with hidden SDK UI, a circular camera window,
custom progress and quality indicators, always-visible health-risk inputs, and
a final results section revealed after measurement completion.

## Setup

Copy or link the Capacitor SDK package into this directory as
`capacitor-shenai-sdk`. The SDK directory must include `package.json`,
`android`, and `ios`.

The API key is intentionally not stored in the project. Pass it to Vite at build
time with `VITE_SHENAI_API_KEY=<your-api-key>`. The generated `dist` directory is
ignored and should not be committed.

## Android

Run from the repository root:

```bash
cd examples/capacitor/capacitor-custom-ui

npm install
VITE_SHENAI_API_KEY=<your-api-key> npm run build
npx cap sync android
npx cap run android
```

Android builds require JDK 21 or newer because Capacitor compiles its Android
library with Java 21. On macOS with Android Studio installed, this JDK is
available as the bundled JetBrains Runtime:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npx cap run android
```

## iOS

Run from the repository root:

```bash
cd examples/capacitor/capacitor-custom-ui

npm install
VITE_SHENAI_API_KEY=<your-api-key> npm run build
npx cap sync ios
npx cap open ios
```

In Xcode, select the `App` target, choose your development team, verify the
bundle identifier, select a physical iPhone, and run the app. Rebuild and run
`npx cap sync ios` again whenever you change the API key or web code.

Dependency lockfiles are intentionally not committed for this example. Run
`npm install` and `npx cap sync ios` to regenerate them locally when needed.
