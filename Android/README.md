# HundredX Android App

## Overview
Native Android application for the HundredX Solana memecoin trading platform, built with Kotlin and Jetpack Compose.

## Tech Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **Networking**: Retrofit + OkHttp
- **Database**: Room
- **Blockchain**: Solana Android SDK

## Project Structure
```
Android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hundredx/
│   │   │   │   ├── ui/
│   │   │   │   ├── viewmodel/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── network/
│   │   │   │   └── database/
│   │   │   └── res/
│   │   └── test/
│   ├── build.gradle
│   └── AndroidManifest.xml
├── gradle/
└── settings.gradle
```

## Getting Started

### Requirements
- Android Studio Flamingo+
- Android SDK 28+
- Kotlin 1.8+
- Gradle 8.0+

### Installation
1. Clone the repository
2. Open project in Android Studio
3. Sync Gradle files
4. Configure `local.properties` with SDK path
5. Update API endpoints in `Constants.kt`
6. Run on emulator or device

## Features
- ✅ User Authentication (Sign up/Login)
- ✅ Solana Wallet Integration
- ✅ Buy/Sell Trading
- ✅ Real-time Price Charts
- ✅ Portfolio Tracking
- ✅ Follow/Unfollow Users
- ✅ Social Trading Feed
- ✅ Push Notifications
- ✅ Price Alerts

## Key Components

### Architecture
- **UI Layer**: Jetpack Compose
- **ViewModel**: State management
- **Repository**: Data abstraction
- **Network**: API calls via Retrofit
- **Database**: Room for local caching

### Authentication
- Biometric authentication
- JWT token management
- Secure preferences

### Trading
- Real-time order placement
- Transaction history
- Slippage calculation
- Gas fee estimation

### Social
- User profiles
- Follower/Following system
- Feed with real-time updates
- Leaderboard

## API Integration
Update `Constants.kt` with your backend URL:

```kotlin
const val API_BASE_URL = "http://localhost:5000/api"
```

## Building for Release
```bash
./gradlew assembleRelease
```

## Play Store Submission
Ensure compliance with Play Store policies:
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Gradle version compatibility
- [ ] Target API level compliance
- [ ] Proper permissions

## Dependencies
- Jetpack Compose
- Room Database
- Retrofit + OkHttp
- Coroutines
- Hilt for DI
- Solana SDK

## Contributing
See the main repository's CONTRIBUTING.md for guidelines.

## License
MIT License - See LICENSE file
