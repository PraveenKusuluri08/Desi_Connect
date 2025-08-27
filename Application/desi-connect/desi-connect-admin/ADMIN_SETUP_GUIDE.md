# 🛡️ DesiConnect Admin App Setup Guide

## 📱 **Complete Admin Mobile Application**

Your admin app is now ready! It uses the **same Firebase backend** as your main DesiConnect app, so it will manage all your existing users and rides data.

## 🚀 **Quick Start**

### **1. Configure Firebase**
Update `config/firebase.ts` with your actual Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

### **2. Run the Admin App**
```bash
cd desi-connect-admin
npm start
```

### **3. Login with Admin Credentials**
- **Email**: `admin@desiconnect.edu`
- **Password**: `Admin123!`

## 📊 **Admin Features**

### **🏠 Dashboard**
- **Real-time statistics** from your main app
- **Quick action buttons** for navigation
- **Recent activity feed**
- **Live user and ride counts**

### **📈 Analytics**
- **Key metrics** with trend indicators
- **Performance statistics**
- **Recent activity tracking**
- **Top users analysis**
- **Revenue calculations**

### **👥 User Management**
- **View all users** from your main app
- **Search and filter** users
- **Ban/unban users**
- **Delete user accounts**
- **Admin role management**

### **🚗 Ride Management**
- **Monitor all rides** from your main app
- **Update ride status** (complete, cancel, reactivate)
- **Search and filter** rides
- **Delete rides**
- **View ride details**

### **⚙️ Settings**
- **Admin profile** information
- **App configuration** toggles
- **Security settings**
- **System maintenance** tools
- **Data backup** options

## 🔐 **Admin Authentication**

### **Admin Role Requirements**
Users must have either:
- `role: "admin"` in Firestore
- `isAdmin: true` in Firestore

### **Create Admin User**
1. **Option 1**: Use the admin app's "Create Admin" feature
2. **Option 2**: Manually add admin role in Firebase Console
3. **Option 3**: Use the main app's admin creation screen

## 📁 **Data Integration**

### **Firebase Collections Used**
- **`users`** - User data and admin roles
- **`rides`** - Ride information and status

### **Real-time Features**
- **Live statistics** from your main app
- **Instant updates** when data changes
- **Professional loading states**

## 🎨 **Professional Admin UI**

### **Design Features**
- **Dark theme** optimized for admin use
- **Professional admin branding**
- **Responsive layout**
- **Smooth animations**

### **Navigation**
- **Tab-based navigation**
- **Easy access** to all features
- **Professional admin interface**

## 🔧 **Technical Stack**

- **Framework**: Expo with React Native
- **Navigation**: Expo Router
- **Backend**: Firebase (same as main app)
- **UI Components**: Custom components with LinearGradient
- **Animations**: React Native Animatable
- **Icons**: Expo Vector Icons

## 📱 **Two Separate Apps**

### **Main App** (`desi-connect`)
- **For regular users**
- **Ride booking and sharing**
- **User features**

### **Admin App** (`desi-connect-admin`)
- **For administrators only**
- **Complete management tools**
- **Professional admin interface**

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

### **Admin Access**
- **Role-based access control**
- **Firebase authentication**
- **Admin-only features**

### **Data Protection**
- **Admin-only data access**
- **Secure Firebase rules**
- **Protected admin features**

## 📞 **Support**

### **Admin App Support**
- **Email**: admin@desiconnect.edu
- **Documentation**: This guide
- **Issues**: Check Firebase configuration

## 🎉 **Benefits**

### **Complete Separation**
- **Independent apps** for users and admins
- **Different app stores**
- **Separate versioning**

### **Professional Management**
- **Real-time data** from your main app
- **Complete user control**
- **Advanced ride management**
- **Professional analytics**

### **Easy Maintenance**
- **Independent development**
- **Different release cycles**
- **Easier maintenance**

---

**🎉 Your admin mobile application is now ready to manage your DesiConnect platform!**

The admin app provides complete control over your main app's data with a professional, separate interface designed specifically for administrators.
