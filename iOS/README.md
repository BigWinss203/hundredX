# HundredX iOS App

## Overview
Native iOS application for the HundredX Solana memecoin trading platform, built with Swift and SwiftUI.

## Tech Stack
- **Language**: Swift 5.0+
- **Framework**: SwiftUI
- **Networking**: URLSession / Alamofire
- **Database**: CoreData / SQLite
- **Blockchain**: Solana Swift SDK

## Project Structure
```
iOS/
├── HundredX/
│   ├── App/
│   ├── Models/
│   ├── ViewModels/
│   ├── Views/
│   ├── Services/
│   └── Resources/
├── HundredXTests/
└── HundredX.xcodeproj/
```

## Getting Started

### Requirements
- Xcode 14.0+
- iOS 15.0+
- Swift 5.0+

### Installation
1. Open `HundredX.xcodeproj` in Xcode
2. Install dependencies via CocoaPods or SPM
3. Configure `.plist` files with API endpoints
4. Build and run

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

### Authentication
- Biometric authentication support
- JWT token management
- Secure keychain storage

### Trading
- Real-time order placement
- Transaction history
- Slippage protection
- Gas estimation

### Social
- User profiles
- Follower/Following system
- Trade sharing
- Leaderboard

## API Integration
All backend API calls are handled through the Service layer. Update the `Config.swift` file with your backend URL:

```swift
let API_BASE_URL = "http://localhost:5000/api"
```

## Building for Release
```bash
xcodebuild -scheme HundredX -configuration Release
```

## App Store Submission
Ensure compliance with App Store guidelines:
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Financial app requirements
- [ ] Proper error handling
- [ ] Crash reporting

## Contributing
See the main repository's CONTRIBUTING.md for guidelines.

## License
MIT License - See LICENSE file
