/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { hasPermission as checkPermission } from '../services/permissions';

const AuthContext = createContext();


export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Permission checker bound to current user role
    const hasPermission = useCallback((action) => {
        if (!userData?.role) return false;
        return checkPermission(userData.role, action);
    }, [userData]);

    // Sign up and create user document in Firestore
    async function signup(email, password, role, name, extraFields = {}) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create their profile in firestore with pending approval status
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    name: name,
                    role: role,
                    kycStatus: 'pending',
                    approvalStatus: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...extraFields, // Role-specific fields (barNumber, licenseNumber, etc.)
                });
            } catch (firestoreError) {
                console.error('Firestore error:', firestoreError.message || 'Unknown error');
                console.log('User authenticated but Firestore document creation failed. This can be fixed later.');
            }

            return user;
        } catch (error) {
            console.error('Signup error:', error.message || 'Unknown error');

            if (error.code === 'auth/operation-not-allowed') {
                throw new Error('Email/password authentication is not enabled. Please contact support.');
            }

            if (error.code === 'auth/configuration-not-found') {
                throw new Error('Firebase is not properly configured. Please contact support.');
            }

            throw error;
        }
    }

    // Log in
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Log out
    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // Fetch additional user role data from firestore
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();

                        // If user doesn't have approvalStatus, add it as 'approved' for backward compatibility
                        if (!data.approvalStatus) {
                            try {
                                await updateDoc(docRef, {
                                    approvalStatus: 'approved',
                                    updatedAt: new Date().toISOString()
                                });
                                data.approvalStatus = 'approved';
                                console.log('Added approvalStatus to user');
                            } catch (updateError) {
                                console.error('Could not update approvalStatus:', updateError.message);
                                // Set it locally anyway for this session
                                data.approvalStatus = 'approved';
                            }
                        }

                        setUserData(data);
                    } else {
                        // User exists in Auth but not in Firestore
                        // This can happen if Firestore wasn't set up during signup
                        console.log('User authenticated but no Firestore document found. Creating one now...');

                        // Create a basic user document
                        try {
                            await setDoc(docRef, {
                                uid: user.uid,
                                email: user.email,
                                name: user.displayName || 'User',
                                role: 'investor', // default role
                                kycStatus: 'pending',
                                approvalStatus: 'pending',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            });

                            // Fetch the newly created document
                            const newDocSnap = await getDoc(docRef);
                            if (newDocSnap.exists()) {
                                setUserData(newDocSnap.data());
                            }
                        } catch (createError) {
                            console.log('Could not create Firestore document. Firestore may not be configured yet.');
                            // Set minimal user data from auth
                            setUserData({
                                uid: user.uid,
                                email: user.email,
                                role: 'investor'
                            });
                        }
                    }
                } catch (error) {
                    console.log('Firestore not configured yet. User can still authenticate.');
                    // Set minimal user data from auth
                    setUserData({
                        uid: user.uid,
                        email: user.email,
                        role: 'investor'
                    });
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        loading,
        signup,
        login,
        logout,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
