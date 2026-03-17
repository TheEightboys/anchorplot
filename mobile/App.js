import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/services/firebase';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setUserProfile(null);
        setInitializing(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (profileSnap.exists()) {
          setUserProfile({ id: profileSnap.id, ...profileSnap.data() });
        } else {
          setUserProfile({ uid: user.uid, email: user.email, role: 'investor' });
        }
      } catch {
        setUserProfile({ uid: user.uid, email: user.email, role: 'investor' });
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fb' }}>
        <ActivityIndicator size="large" color="#1e5631" />
      </View>
    );
  }

  if (!firebaseUser) {
    return <AuthScreen />;
  }

  return <HomeScreen userProfile={userProfile} />;
}
