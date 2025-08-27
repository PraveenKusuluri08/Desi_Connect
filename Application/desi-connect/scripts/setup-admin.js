// Setup Admin Users Script
// Run this script to set up admin users in your Firestore database

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDPNfGyown0prWqTcKkqGa3c3q5lYOa2no",
  authDomain: "desi-connect-app.firebaseapp.com",
  projectId: "desi-connect-app",
  storageBucket: "desi-connect-app.appspot.com",
  messagingSenderId: "1061001522905",
  appId: "1:1061001522905:ios:9d8e8e6c29a0aeb9ff6827",
  measurementId: "G-WR4HDMDQ1C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to set up admin user
async function setupAdminUser(userId, userEmail, displayName = 'Admin User') {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user already exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user to admin
      await setDoc(userRef, {
        ...userDoc.data(),
        role: 'admin',
        isAdmin: true,
        adminSetupAt: new Date().toISOString(),
      }, { merge: true });
      console.log(`✅ User ${userEmail} is now an admin!`);
    } else {
      // Create new admin user
      await setDoc(userRef, {
        email: userEmail,
        displayName: displayName,
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        adminSetupAt: new Date().toISOString(),
      });
      console.log(`✅ Created new admin user: ${userEmail}`);
    }
  } catch (error) {
    console.error(`❌ Error setting up admin for ${userEmail}:`, error);
  }
}

// Example usage - replace with your actual user IDs and emails
async function setupAdmins() {
  console.log('🚀 Setting up admin users...\n');
  
  // Add your admin users here
  // You need to get the user ID from Firebase Auth or your app
  const adminUsers = [
    {
      userId: 'YOUR_USER_ID_HERE', // Replace with actual user ID
      email: 'admin@desiconnect.com',
      displayName: 'Admin User'
    },
    // Add more admin users as needed
  ];
  
  for (const admin of adminUsers) {
    await setupAdminUser(admin.userId, admin.email, admin.displayName);
  }
  
  console.log('\n🎉 Admin setup complete!');
}

// Run the setup
setupAdmins().catch(console.error);

module.exports = { setupAdminUser };
