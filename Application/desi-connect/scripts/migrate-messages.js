// Migration Script: Move messages from subcollections to separate collection
// Run this script once to migrate existing messages

import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../config/fbConfig";

const migrateMessages = async () => {
  try {
    console.log('Starting message migration...');
    
    // Get all chat documents
    const chatsSnapshot = await getDocs(collection(db, 'chats'));
    let totalMigrated = 0;
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatId = chatDoc.id;
      console.log(`Processing chat: ${chatId}`);
      
      try {
        // Get messages from old subcollection structure
        const oldMessagesSnapshot = await getDocs(collection(db, `chats/${chatId}/messages`));
        
        for (const messageDoc of oldMessagesSnapshot.docs) {
          const messageData = messageDoc.data();
          
          // Add chatId to message data
          const newMessageData = {
            ...messageData,
            chatId: chatId
          };
          
          // Add to new messages collection
          await addDoc(collection(db, 'messages'), newMessageData);
          
          // Delete from old location
          await deleteDoc(doc(db, `chats/${chatId}/messages/${messageDoc.id}`));
          
          totalMigrated++;
        }
        
        console.log(`Migrated ${oldMessagesSnapshot.docs.length} messages from chat ${chatId}`);
      } catch (error) {
        console.error(`Error migrating chat ${chatId}:`, error);
      }
    }
    
    console.log(`Migration complete! Total messages migrated: ${totalMigrated}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Uncomment the line below to run migration
// migrateMessages();

export default migrateMessages; 