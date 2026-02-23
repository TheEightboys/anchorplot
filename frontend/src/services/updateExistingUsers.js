/**
 * One-time script to update existing users with approvalStatus field
 * Run this in browser console or create a button to trigger it
 */

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const updateExistingUsers = async () => {
  try {
    console.log('🔄 Updating existing users with approvalStatus...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let updated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Only update if approvalStatus doesn't exist
      if (!userData.approvalStatus) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          approvalStatus: 'pending', // Set to pending by default
          updatedAt: new Date().toISOString()
        });
        updated++;
        console.log(`✅ Updated user: ${userData.email}`);
      }
    }
    
    console.log(`✅ Updated ${updated} users with approvalStatus field`);
    return { success: true, updated };
  } catch (error) {
    console.error('❌ Error updating users:', error);
    return { success: false, error: error.message };
  }
};

// Function to manually approve a user (for testing)
export const approveUser = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      approvalStatus: 'approved',
      approvedAt: new Date().toISOString()
    });
    console.log(`✅ User ${userId} approved`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error approving user:', error);
    return { success: false, error: error.message };
  }
};

// Function to create admin user
export const makeUserAdmin = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      approvalStatus: 'approved',
      kycStatus: 'verified',
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ User ${userId} is now an admin`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    return { success: false, error: error.message };
  }
};
