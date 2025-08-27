// Create Admin User Script
// This script helps you create the first admin user in Firebase

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email, password, displayName = 'Admin User') {
  try {
    console.log('🚀 Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User created in Firebase Auth:', user.uid);
    
    // Create admin user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: email,
      displayName: displayName,
      role: 'admin',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      adminSetupAt: new Date().toISOString(),
      uid: user.uid
    });
    
    console.log('✅ Admin user document created in Firestore');
    
    // Display user details
    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.uid);
    console.log('Display Name:', displayName);
    console.log('Role: admin');
    console.log('=====================================');
    console.log('\n📱 You can now login to your app with these credentials!');
    console.log('🔐 Navigate to /admin/setup to access the admin panel');
    
    return {
      email,
      password,
      uid: user.uid,
      displayName
    };
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  const adminEmail = 'admin@desiconnect.edu';
  const adminPassword = 'Admin123!'; // Change this to a secure password
  const adminName = 'DesiConnect Admin';
  
  try {
    await createAdminUser(adminEmail, adminPassword, adminName);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminUser };
