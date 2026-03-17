import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function HomeScreen({ userProfile }) {
  const role = userProfile?.role || 'investor';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AnchorPlot</Text>
      <Text style={styles.subtitle}>Signed in as {userProfile?.name || userProfile?.email || 'User'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mobile Role</Text>
        <Text style={styles.cardValue}>{role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Focus Modules (MVP)</Text>
        <Text style={styles.item}>• Owner: listing status + deal checkpoints</Text>
        <Text style={styles.item}>• Developer: pitch workflow + deal room updates</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f6f8fb' },
  title: { fontSize: 26, fontWeight: '700', color: '#15351f', marginTop: 30 },
  subtitle: { fontSize: 14, color: '#5b6d60', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d3dfd7',
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 12, color: '#5b6d60', marginBottom: 6, textTransform: 'uppercase' },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#1e5631' },
  item: { color: '#20352a', fontSize: 13, marginBottom: 3 },
  button: {
    marginTop: 10,
    backgroundColor: '#1e5631',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
