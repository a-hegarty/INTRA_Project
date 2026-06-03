import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
// @ts-ignore 
import { COLORS, FONTS } from '../../theme'; 

const MY_INGREDIENTS = ['Chicken Breast', 'Spinach', 'Brown Rice', 'Garlic', 'Lemon', 'Olive Oil'];

export default function Page() {
  const [missingCount, setMissingCount] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Main Title Section */}
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

        {/* Missing Ingredients Slider Section */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sectionHeader}>Max Missing Ingredients</Text>
            <Text style={styles.sliderValue}>{missingCount}</Text>
          </View>
          <Text style={styles.sliderSubtitle}>Updates live as you adjust recipe strictness...</Text>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1} 
            value={missingCount}
            onValueChange={(val) => setMissingCount(val)} 
            minimumTrackTintColor={COLORS.primaryGreen}  
            maximumTrackTintColor={COLORS.borderGray}   
            thumbTintColor={COLORS.textGreen}       
          />
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
    marginBottom: 32,
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
  sliderSection: {
    marginBottom: 24,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  sliderSubtitle: {
    fontSize: 13,
    color: COLORS.textLightGray,
    marginTop: -8,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});