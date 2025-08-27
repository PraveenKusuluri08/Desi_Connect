# 🛡️ DesiConnect Admin App

A separate mobile application for administrators to manage the DesiConnect ride-sharing platform.

## 📱 **App Overview**

This is a dedicated admin mobile application that provides comprehensive management tools for the DesiConnect platform. It's completely separate from the main user app and designed specifically for administrators.

## 🚀 **Features**

### **📊 Dashboard**
- Real-time statistics overview
- Quick action buttons
- Recent activity feed
- Live data from Firebase

### **📈 Analytics**
- Detailed user statistics
- Ride analytics and trends
- Revenue tracking
- Popular routes analysis

### **👥 User Management**
- View all registered users
- Ban/unban users
- Delete user accounts
- Search and filter users

### **🚗 Ride Management**
- Monitor all ride activities
- Update ride status
- Cancel/complete rides
- Advanced filtering and search

### **⚙️ Settings**
- Admin profile management
- App configuration
- Security settings
- System maintenance tools

## 🛠️ **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Configure Firebase**
1. Update `config/firebase.ts` with your Firebase project configuration
2. Make sure your Firebase project has the same structure as the main app

### **3. Create Admin User**
1. Use the main DesiConnect app to create an admin user
2. Or manually add admin role in Firebase Console

### **4. Run the App**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🔐 **Admin Access**

### **Admin Credentials**
- **Email**: `admin@desiconnect.edu`
- **Password**: `Admin123!`

### **Admin Role Requirements**
The user must have either:
- `role: "admin"` in Firestore
- `isAdmin: true` in Firestore

## 📁 **Project Structure**

```
desi-connect-admin/
├── app/                    # Main app screens
│   ├── _layout.tsx        # Tab navigation
│   ├── index.tsx          # Dashboard
│   ├── analytics.tsx      # Analytics screen
│   ├── users.tsx          # User management
│   ├── rides.tsx          # Ride management
│   └── settings.tsx       # Admin settings
├── config/
│   └── firebase.ts        # Firebase configuration
├── assets/                # App assets
└── README.md             # This file
```

## 🎨 **UI/UX Features**

### **Professional Design**
- Dark theme optimized for admin use
- Professional color scheme
- Admin-specific branding
- Responsive layout

### **Navigation**
- Tab-based navigation
- Easy access to all features
- Professional admin interface

### **Real-time Data**
- Live statistics from Firebase
- Real-time updates
- Professional loading states

## 🔧 **Technical Stack**

- **Framework**: Expo with React Native
- **Navigation**: Expo Router
- **Backend**: Firebase (Firestore, Auth)
- **UI Components**: Custom components with LinearGradient
- **Animations**: React Native Animatable
- **Icons**: Expo Vector Icons

## 📊 **Data Sources**

### **Firebase Collections**
- `users` - User data and admin roles
- `rides` - Ride information and status
- `analytics` - Analytics data (if implemented)

### **Real-time Features**
- Live user count
- Real-time ride monitoring
- Instant status updates
- Live analytics

## 🚀 **Deployment**

### **Development**
```bash
npm start
```

### **Production Build**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🔒 **Security**

### **Admin Authentication**
- Firebase Authentication
- Role-based access control
- Secure admin verification

### **Data Protection**
- Admin-only data access
- Secure Firebase rules
- Protected admin features

## 📞 **Support**

For admin app support:
- **Email**: admin@desiconnect.edu
- **Documentation**: This README
- **Issues**: Check Firebase configuration

## 🔄 **Updates**

### **Version History**
- **v1.0.0** - Initial admin app release
- Professional admin interface
- Complete management tools
- Real-time data integration

---

**🎉 The DesiConnect Admin App provides a complete, professional admin experience separate from the main user application!**
