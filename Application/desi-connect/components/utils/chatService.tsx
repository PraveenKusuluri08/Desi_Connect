import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/fbConfig';

export const generateRoomId = (rideId: string, user1: string, user2: string): string => {
  const sorted = [user1, user2].sort(); // ensures both users land in the same room
  return `${rideId}_${sorted[0]}_${sorted[1]}`;
};

export const sendChatMessage = async (
  rideId: any,
  senderId: string,
  receiverId: string,
  text: string
): Promise<void> => {
  if (!text.trim()) return;
  if (!senderId || !receiverId || senderId === receiverId) {
    console.warn('Receiver is not valid or same as sender.');
    return;
  }

  const roomId = generateRoomId(rideId, senderId, receiverId);
  const messageRef = collection(db, 'ride_chats', roomId, 'messages');

  await addDoc(messageRef, {
    text,
    sender: senderId,
    receiver: receiverId,
    createdAt: Timestamp.now(),
  });
};

export const listenToMessages = (
  rideId: any,
  user1: string,
  user2: any,
  callback: (messages: any[]) => void
): (() => void) => {
  const roomId = generateRoomId(rideId, user1, user2);
  const roomRef = collection(db, 'ride_chats', roomId, 'messages');
  const q = query(roomRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });

  return unsubscribe;
};
