# 🔥 Firebase Setup Guide for DesiConnect

## 📋 **Prerequisites**
- Google account
- Basic understanding of web development

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Firebase Project**

1. **Go to** [Firebase Console](https://console.firebase.google.com/)
2. **Click "Create a project"**
3. **Enter project name**: `desi-connect-app`
4. **Enable Google Analytics** (recommended)
5. **Click "Create project"**

### **Step 2: Set Up Authentication**

1. **In Firebase Console**, go to **Authentication**
2. **Click "Get started"**
3. **Go to "Sign-in method"** tab
4. **Enable Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### **Step 3: Set Up Firestore Database**

1. **In Firebase Console**, go to **Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select a location** (choose closest to your users)
5. **Click "Done"**

### **Step 4: Get Your Firebase Config**

1. **In Firebase Console**, go to **Project Settings** (gear icon)
2. **Scroll down to "Your apps"**
3. **Click "Add app"** → **Web app**
4. **Register app** with name "DesiConnect"
5. **Copy the config** and replace in `firebaseconfig.ts`

### **Step 5: Update Firebase Config**

Replace the config in `firebaseconfig.ts` with your own:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

### **Step 6: Set Up Security Rules (Optional but Recommended)**

1. **In Firestore Database**, go to **Rules** tab
2. **Replace with these rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read/write all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🛠️ **Testing Your Setup**

### **1. Test Authentication**
- Try signing up with a new email
- Check if user appears in Firebase Console → Authentication

### **2. Test Firestore**
- Create a user account
- Check if user document appears in Firestore Database

### **3. Test Admin Setup**
- Navigate to `/admin/setup` in your app
- Click "Make Me Admin"
- Check if admin role is added to your user document

## 🔐 **Admin Setup Process**

### **Method 1: Using the App (Recommended)**
1. **Sign up/login** to your app
2. **Navigate to** `/admin/setup`
3. **Click "Make Me Admin"**
4. **Access** `/admin` dashboard

### **Method 2: Manual Firestore Setup**
1. **Go to** Firebase Console → Firestore Database
2. **Find your user document** in the `users` collection
3. **Add these fields**:
   ```json
   {
     "role": "admin",
     "isAdmin": true,
     "adminSetupAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## 📱 **Admin Panel Features**

Once set up, you'll have access to:
- **Dashboard** - Overview statistics
- **User Management** - Ban/unban users, delete accounts
- **Ride Monitoring** - Track all ride activities
- **Analytics** - View detailed statistics
- **Settings** - Configure admin panel

## ⚠️ **Important Notes**

1. **Keep your API keys secure** - Don't commit them to public repositories
2. **Use environment variables** for production
3. **Set up proper security rules** before going live
4. **Backup your data** regularly

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user is authenticated

2. **"Project not found" errors**
   - Verify project ID in config
   - Check if project exists in Firebase Console

3. **Authentication not working**
   - Enable Email/Password in Authentication
   - Check if user exists in Firebase Console

4. **Admin access not working**
   - Verify admin role in Firestore
   - Check user document structure

## 📞 **Need Help?**

- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Support**: [https://firebase.google.com/support](https://firebase.google.com/support)

---

**🎉 Once you complete this setup, your DesiConnect app will have a fully functional admin panel!**
