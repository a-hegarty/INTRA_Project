import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
// @ts-ignore
import { COLORS } from '../../theme';

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.subtitle}>Your dietary preferences live here.</Text>
      <Link href="/" style={styles.link}>⬅️ Back to Pantry</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.backgroundWhite, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.primaryGreen, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textLightGray, marginBottom: 24 },
  link: { color: COLORS.textGreen, fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' }
});