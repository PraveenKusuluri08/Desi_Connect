# DesiConnect 🚗💬

A comprehensive ride-sharing and community platform designed specifically for university students, built with React Native and Expo.

## 🌟 Features

### 🚗 Ride Sharing
- **Post Rides**: Create ride offers with pickup/dropoff locations, date/time, and pricing
- **Find Rides**: Search and filter available rides by location, date, and price
- **Accept Rides**: Book rides with real-time status updates
- **Popular Routes**: Discover trending routes between popular destinations
- **Location Services**: Integrated Google Places API for accurate address input

### 💬 Community Chat
- **Individual Chats**: Direct messaging between users
- **University Groups**: Connect with students from your university
- **Ride Chats**: Dedicated chat rooms for ride coordination
- **Real-time Messaging**: Live chat with read receipts and typing indicators
- **Media Sharing**: Send text, images, and location sharing

### 👤 User Management
- **Authentication**: Secure Firebase Authentication with email/password
- **User Profiles**: Customizable profiles with university affiliation
- **University Search**: Find and join your university community
- **Profile Management**: Update personal information and preferences

### 🛡️ Admin Panel
- **Dashboard Analytics**: Real-time statistics and insights
- **User Management**: View and manage all registered users
- **Ride Monitoring**: Track active and completed rides
- **System Settings**: Configure platform parameters
- **Analytics**: Detailed usage statistics and reports

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for iOS and Android
- **Smooth Animations**: React Native Animatable for fluid interactions
- **Dark/Light Mode**: Automatic theme switching
- **Haptic Feedback**: Enhanced user experience with tactile responses
- **Modern Components**: Custom UI components with gradient backgrounds

## 🛠️ Tech Stack

- **Frontend**: React Native 0.79.5, Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **State Management**: Zustand, React Context
- **Backend**: Firebase (Firestore, Authentication)
- **Maps & Location**: React Native Maps, Expo Location
- **UI Components**: NativeWind, React Native Animatable
- **Icons**: Expo Vector Icons
- **Styling**: Linear Gradients, Custom Components

## 📱 Platform Support

- ✅ iOS (iPhone & iPad)
- ✅ Android
- ✅ Web (React Native Web)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd desi-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `config/fbConfig.ts` with your Firebase credentials

4. **Configure Google Places API**
   - Get a Google Places API key
   - Update `config/placesConfig.ts` with your API key

5. **Start the development server**
   ```bash
   npx expo start
   ```

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Lint code
npm run lint

# Reset project (clean slate)
npm run reset-project
```

## 📁 Project Structure

```
desi-connect/
├── app/                          # Main application screens
│   ├── (admin)/                  # Admin panel routes
│   ├── (protected)/              # Authenticated user routes
│   ├── (tabs)/                   # Tab navigation
│   ├── login/                    # Authentication screens
│   └── signup/
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   └── utils/                    # Utility components
├── config/                       # Configuration files
├── context/                      # React Context providers
├── hooks/                        # Custom React hooks
├── assets/                       # Images, fonts, and static assets
└── scripts/                      # Build and setup scripts
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up security rules for Firestore
5. Update `config/fbConfig.ts` with your project credentials

### Google Places API
1. Enable Google Places API in Google Cloud Console
2. Create API credentials
3. Update `config/placesConfig.ts` with your API key

### Environment Variables
Create a `.env` file in the root directory:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

## 👥 User Roles

### Regular Users
- Create and book rides
- Send and receive messages
- Manage profile information
- Join university communities

### Admins
- Access admin dashboard
- View system analytics
- Manage users and rides
- Configure platform settings

## 🔒 Security Features

- Firebase Authentication for secure user login
- Firestore security rules for data protection
- Input validation and sanitization
- Secure API key management
- Real-time data synchronization

## 📊 Analytics & Monitoring

- User engagement metrics
- Ride completion rates
- Popular routes tracking
- System performance monitoring
- Error tracking and logging

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### App Store Deployment
1. Configure app.json with proper metadata
2. Build production version
3. Submit to App Store Connect (iOS) or Google Play Console (Android)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the setup guides in the project root
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join our Discord community for help and discussions

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Powered by [Firebase](https://firebase.google.com)
- Maps by [Google Maps Platform](https://developers.google.com/maps)
- Icons by [Expo Vector Icons](https://expo.github.io/vector-icons/)

---

**DesiConnect** - Connecting university students through rides and community! 🎓🚗
