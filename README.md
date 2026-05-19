# Prompt Lab - Premium AI Marketplace

This is a production-ready React Native Expo application built with TypeScript.

## Features
- **Premium UI**: Futuristic dark theme with cinematic aesthetics.
- **Explore Marketplace**: Trending and recent AI prompts with copy functionality.
- **UTR Payment System**: Manual UTR submission for permanent premium unlock.
- **AdMob Integrated**: Professional monetization with test IDs.
- **Firebase Firestore**: Real-time data sync for prompts and approvals.

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npx expo start
   ```

3. Open in Expo Go:
   - Scan the QR code with your Expo Go app (Android/iOS).

## Production Release (Play Store)
- Update `app.json` with your real package name and credentials.
- Replace AdMob test IDs in `src/constants/theme.ts` with real production IDs.
- Update `android:targetSdkVersion` if needed.
- Build the APK/AAB:
  ```bash
  eas build -p android --profile production
  ```

## AdMob IDs
- **Banner**: `src/constants/theme.ts`
- **Interstitial**: `src/constants/theme.ts`
- **Native**: `src/screens/ExploreScreen.tsx`

## Project Structure
- `/src/components`: Reusable UI components.
- `/src/screens`: Main page implementations.
- `/src/firebase`: Database configuration.
- `/src/navigation`: Tab navigation logic.
- `/src/hooks`: Global state and device context.
- `/src/constants`: Theme colors and configuration.
- `/src/services`: AdMob and external services.
