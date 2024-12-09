# SportConnect Mobile App

## 📱 Overview
SportConnect is a cross-platform mobile application for sports team management built with React Native and Expo.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Android Studio (for Android development)
- Android SDK with API level 23 (Android 6.0) or higher

### Installation
1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd mobile
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Environment Setup:
- Copy \`.env.example\` to \`.env\`
- Fill in your Firebase configuration values
\`\`\`bash
cp .env.example .env
\`\`\`

### Running the App
- Android:
\`\`\`bash
npm run android
\`\`\`

## 🏗️ Project Structure
\`\`\`
mobile/
├── src/                    # Source files
│   ├── components/         # Reusable components
│   ├── screens/           # Screen components
│   ├── services/          # External services (Firebase, etc.)
│   ├── navigation/        # Navigation configuration
│   └── utils/             # Utility functions
├── assets/                # Static assets
└── __tests__/            # Test files
\`\`\`

## 📚 Tech Stack
- React Native 0.73.2
- Expo SDK 52
- TypeScript 5.3
- Firebase 10.7.0
- React Navigation 6.x

## 🔒 Security
- Environment variables are stored in \`.env\` (not committed to git)
- Firebase configuration files are ignored by git
- Sensitive keys and certificates are excluded from version control

## 🧪 Testing
\`\`\`bash
npm test
\`\`\`

## 📝 Documentation
- Component documentation is generated using TypeDoc
- API documentation is available in the \`docs\` folder

## 📱 Supported Platforms
- Android 6.0 (API level 23) and above
- iOS 13 and above (future support)

## 🤝 Contributing
1. Create a feature branch
2. Commit changes
3. Push to the branch
4. Create a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details
