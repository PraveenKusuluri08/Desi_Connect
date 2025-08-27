# 🔐 Admin User Setup Instructions

## 📋 **Complete Setup Process**

### **Step 1: Create Firebase Project**

1. **Go to** [Firebase Console](https://console.firebase.google.com/)
2. **Click "Create a project"**
3. **Project name**: `desi-connect-admin`
4. **Enable Google Analytics** ✅
5. **Click "Create project"**

### **Step 2: Set Up Authentication**

1. **In Firebase Console**, go to **Authentication**
2. **Click "Get started"**
3. **Go to "Sign-in method"** tab
4. **Enable Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" ✅
   - Click "Save"

### **Step 3: Set Up Firestore Database**

1. **Go to Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"**
4. **Select location** (closest to you)
5. **Click "Done"**

### **Step 4: Get Your Firebase Config**

1. **Go to Project Settings** (gear icon)
2. **Scroll to "Your apps"**
3. **Click "Add app"** → **Web app**
4. **App name**: "DesiConnect Admin"
5. **Copy the config** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123"
};
```

### **Step 5: Update Your App Config**

1. **Open** `firebaseconfig.ts`
2. **Replace** the placeholder config with your real config
3. **Save** the file

### **Step 6: Create Admin User**

1. **Open** `scripts/create-admin-user.js`
2. **Replace** the Firebase config with your real config
3. **Run the script**:

```bash
node scripts/create-admin-user.js
```

### **Step 7: Get Your Admin Credentials**

After running the script, you'll see output like this:

```
🎉 ADMIN USER CREATED SUCCESSFULLY!
=====================================
Email: admin@desiconnect.edu
Password: Admin123!
User ID: abc123def456
Display Name: DesiConnect Admin
Role: admin
=====================================
```

## 🔑 **Your Admin Credentials**

**Email**: `admin@desiconnect.edu`
**Password**: `Admin123!`
**User ID**: (will be shown after script runs)
**Role**: `admin`

## 📱 **How to Use Admin Panel**

1. **Login** to your app with the admin credentials
2. **Navigate to** `/admin/setup`
3. **Click "Make Me Admin"** (if needed)
4. **Access** `/admin` dashboard

## 🧹 **Clean Up (After Setup)**

Once you have your admin credentials, you can:

1. **Delete** `scripts/create-admin-user.js`
2. **Delete** `scripts/setup-admin.js`
3. **Delete** `ADMIN_SETUP_INSTRUCTIONS.md`
4. **Delete** `FIREBASE_SETUP_GUIDE.md`

## ⚠️ **Security Notes**

- **Change the default password** after first login
- **Keep your Firebase config secure**
- **Don't commit admin credentials to git**
- **Set up proper Firestore security rules**

## 🆘 **Troubleshooting**

### **"Permission denied" errors**
- Check if Firestore is in test mode
- Verify Firebase config is correct

### **"User already exists" error**
- Use a different email address
- Or delete the user from Firebase Console

### **"Project not found" error**
- Verify project ID in config
- Check if project exists in Firebase Console

---

**🎉 Once you complete these steps, you'll have a fully functional admin panel!**
