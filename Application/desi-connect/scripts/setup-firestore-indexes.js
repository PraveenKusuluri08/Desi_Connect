// Firestore Indexes Setup Script
// This script helps set up the necessary indexes for the messages collection

const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "chatId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

console.log('Firestore Indexes Configuration:');
console.log(JSON.stringify(firestoreIndexes, null, 2));

console.log('\nTo set up these indexes:');
console.log('1. Go to Firebase Console > Firestore Database > Indexes');
console.log('2. Click "Add Index"');
console.log('3. Collection ID: messages');
console.log('4. Fields: chatId (Ascending), timestamp (Ascending)');
console.log('5. Click "Create Index"');

module.exports = firestoreIndexes; 