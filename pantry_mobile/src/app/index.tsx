import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
// @ts-ignore
import { COLORS, FONTS } from '../../theme'; 

// Placeholder ingredients
const MY_INGREDIENTS = ['Chicken Breast', 'Spinach', 'Brown Rice', 'Garlic', 'Lemon', 'Olive Oil'];

export default function Page() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Main Title */}
        <Text style={styles.mainTitle}>Pantry</Text>
        <Text style={styles.subtitle}>What's in your kitchen?</Text>
        <Text style={styles.description}>Add your ingredients and we'll find healthy meals</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.labelText}>Search Ingredients</Text>
          <TextInput 
            style={styles.searchBar} 
            placeholder="e.g. Chicken, Spinach, Oats"
            placeholderTextColor={COLORS.textLightGray}
          />
        </View>

        {/* Ingredients Section */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionHeader}>Your Ingredients ({MY_INGREDIENTS.length})</Text>
          
          <View style={styles.pillContainer}>
            {MY_INGREDIENTS.map((item, index) => (
              <TouchableOpacity key={index} style={styles.pill}>
                <Text style={styles.pillText}>{item}</Text>
                <Text style={styles.pillClose}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
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
  mainTitle: {
    fontSize: FONTS.header.fontSize,
    fontWeight: FONTS.header.fontWeight as any,
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONTS.subheader.fontSize,
    fontWeight: FONTS.subheader.fontWeight as any,
    color: COLORS.textGreen,
    marginBottom: 4,
  },
  description: {
    fontSize: FONTS.body.fontSize,
    fontWeight: FONTS.body.fontWeight as any,
    color: COLORS.textLightGray,
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 28,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  searchBar: {
    height: 50,
    borderColor: COLORS.borderGray,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 8,        
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGreen,
    marginRight: 6,
  },
  pillClose: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGreen,
    marginTop: -2, 
  },
});