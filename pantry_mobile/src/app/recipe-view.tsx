import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
// @ts-ignore 
import { COLORS } from '../../theme'; 

export default function RecipeViewPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Link href="/" style={styles.backLink}>⬅️ Back to Pantry</Link>
        
        <Text style={styles.title}>Recipe Details Screen</Text>
        
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            [Backend Data Integration Pending]{'\n'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  container: {
    padding: 24,
  },
  backLink: {
    color: COLORS.textGreen,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 24,
  },
  placeholderBox: {
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textLightGray,
    textAlign: 'center',
    lineHeight: 22,
  },
});