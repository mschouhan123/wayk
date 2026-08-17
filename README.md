# Wayk Onboarding

A high-fidelity React Native CLI recreation of the Wayk alarm app onboarding
flow. Built as a mobile engineering assessment with React Native 0.86.2,
TypeScript, Hermes, and the New Architecture enabled.

## Included experience

- Animated launch treatment and smooth screen transitions
- Responsive safe-area layout for compact and large phones
- Reusable progress, button, and selectable-card components
- Morning-energy visualization
- Accessible single-choice questions with disabled/enabled button states
- Interactive alarm-time selector
- Finger-drawn commitment signature with completion feedback
- Referral unlock and onboarding-complete screens
- Back navigation with retained answers

## Requirements

- Node.js 22.11 or newer (React Native 0.86 requirement)
- Ruby and Bundler
- Xcode and CocoaPods for iOS
- JDK 17 and Android Studio for Android

## Run on iOS

```sh
npm install
bundle install
cd ios && bundle exec pod install && cd ..
npm start
```

In a second terminal:

```sh
npm run ios
```

If port 8081 is occupied, stop the existing Metro process before starting this
project. This avoids connecting the simulator to another React Native app.

## Run on Android

Start an Android emulator, then run:

```sh
npm install
npm start
```

In a second terminal:

```sh
npm run android
```

## Quality checks

```sh
npm run lint
npm test -- --runInBand
npx tsc --noEmit
```

## Project structure

- `App.tsx` — app providers and root entry
- `src/OnboardingApp.tsx` — flow state, transitions, and screen composition
- `src/components.tsx` — reusable controls and interactive elements
- `src/data.ts` — declarative screen and question content
- `src/theme.ts` — shared colors and layout tokens
- `src/types.ts` — flow and answer types

## Deliberate tradeoffs

The assessment is an onboarding prototype rather than a production alarm app.
It does not schedule operating-system alarms, send real referral messages, or
persist answers after the app is terminated. The UI uses React Native core
animation and gesture APIs to keep the native dependency surface small and the
project reliable under a short assessment timebox.
