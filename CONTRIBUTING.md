# Contributing to HundredX

Thank you for your interest in contributing to HundredX! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/hundredX.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### iOS
Open `iOS/HundredX.xcodeproj` in Xcode

### Android
Open `Android/` in Android Studio

## Coding Standards

### Backend (JavaScript/Node.js)
- Use ESLint
- Follow async/await patterns
- Add error handling
- Write clear comments

### iOS (Swift)
- Use SwiftUI for UI
- Follow Apple's Swift style guide
- Add proper error handling
- Include unit tests

### Android (Kotlin)
- Use Jetpack Compose
- Follow Kotlin conventions
- Implement proper MVVM architecture
- Add unit tests

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Get review from maintainers
6. Merge when approved

## Reporting Issues

Include:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable

## Feature Requests

- Describe the feature
- Explain the use case
- Suggest implementation if possible

## License

By contributing, you agree your contributions will be licensed under MIT License.

---

Thank you for making HundredX better! 🚀
