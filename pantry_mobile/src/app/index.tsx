import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Link } from 'expo-router';
// @ts-ignore 
import { COLORS, FONTS } from '../../theme'; 
import { useAuth } from '../context/AuthContext';
import { RECIPES_DATABASE } from '../constants/recipes';

// Mock Ingredients
const ALL_DATABASE_INGREDIENTS = [
  'Chicken Breast', 'Chicken Thighs', 'Spinach', 'Brown Rice', 'White Rice',
  'Garlic', 'Lemon', 'Olive Oil', 'Onions', 'Tomatoes', 'Black Beans',
  'Cheddar Cheese', 'Eggs', 'Avocado', 'Bell Peppers', 'Flour', 'Butter'
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    isLoggedIn, 
    username, 
    globalIngredients, 
    setGlobalIngredients,
    globalMissingCount,
    setGlobalMissingCount 
  } = useAuth();

  // Filter dropdown suggestions based on user typing
  const filteredSuggestions = ALL_DATABASE_INGREDIENTS.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !globalIngredients.includes(item)
  );

  const addIngredient = (name: string) => {
    setGlobalIngredients([...globalIngredients, name]);
    setSearchQuery('');
  };

  const removeIngredient = (name: string) => {
    setGlobalIngredients(globalIngredients.filter(item => item !== name));
  };

  const matchingRecipes = RECIPES_DATABASE.filter(recipe => {
    const matchingCount = recipe.ingredients.filter(
      ing => globalIngredients.includes(ing)
    ).length;

    const missingForThisRecipe = recipe.ingredients.length - matchingCount;

    const hasAtLeastOneMatch = matchingCount > 0;
    const passesSliderThreshold = missingForThisRecipe <= globalMissingCount;

    return hasAtLeastOneMatch && passesSliderThreshold;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Welcome Text Header */}
        <Text style={styles.welcomeUser}>Welcome back, {username}</Text>
        
        {/* Main Title Section */}
        <Text style={styles.mainTitle}>Pantry</Text>
        <Text style={styles.subtitle}>What's in your kitchen?</Text>
        <Text style={styles.description}>Add your ingredients and we'll find healthy meals</Text>

        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <Text style={styles.labelText}>Search Ingredients</Text>
          <TextInput 
            style={styles.searchBar}
            placeholder="e.g. Chicken, Spinach, Oats" 
            placeholderTextColor={COLORS.textLightGray}
            value={searchQuery}
            onChangeText={setSearchQuery} 
          />

          {/* Dynamic Search Suggestion Dropdown */}
          {searchQuery.length > 0 && (
            <View style={styles.suggestionsBox}>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => addIngredient(item)}>
                    <Text style={styles.suggestionText}>➕ {item}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultText}>No matching ingredients found</Text>
              )}
            </View>
          )}
        </View>

        {/* Ingredients Section Container */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionHeader}>Your Ingredients ({globalIngredients.length})</Text>
          <View style={styles.pillContainer}>
            {globalIngredients.map((ingredient, index) => (
              <View key={index} style={styles.pill}>
                <Text style={styles.pillText}>{ingredient}</Text>
                <TouchableOpacity onPress={() => removeIngredient(ingredient)}>
                  <Text style={styles.pillClose}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Missing Ingredients Slider Section */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sectionHeader}>Max Missing Ingredients</Text>
            <Text style={styles.sliderValue}>{globalMissingCount}</Text>
          </View>
          <Text style={styles.sliderSubtitle}>Updates live as you adjust recipe strictness...</Text>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1} 
            value={globalMissingCount}
            onValueChange={(val) => setGlobalMissingCount(val)} 
            minimumTrackTintColor={COLORS.primaryGreen}  
            maximumTrackTintColor={COLORS.borderGray}   
            thumbTintColor={COLORS.textGreen}       
          />
        </View>

        {/* Dynamic matching recipes section */}
        <View style={styles.recipesContainer}>
          <Text style={styles.sectionHeader}>Matching Recipes ({matchingRecipes.length})</Text>
          {matchingRecipes.length > 0 ? (
            <View style={styles.recipeGrid}>
              {matchingRecipes.map(recipe => {
                const missingList = recipe.ingredients.filter(ing => !globalIngredients.includes(ing));
                return (
                  <Link key={recipe.id} href="/recipe-view" asChild>
                    <TouchableOpacity style={styles.recipeCard}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <Text style={styles.recipeDetails}>
                        Total Ingredients: {recipe.ingredients.length}  |  
                        <Text style={{ color: missingList.length > 0 ? '#FF9500' : COLORS.textGreen, fontWeight: '600' }}>
                          {' '}Missing: {missingList.length}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </Link>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noRecipesText}>No recipes match your ingredients filter setup.</Text>
          )}
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
    paddingBottom: 100,
  },
  welcomeUser: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLightGray,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 180,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  noResultText: {
    padding: 12,
    fontSize: 14,
    color: COLORS.textLightGray,
    textAlign: 'center',
  },
  recipesContainer: {
    marginTop: 8,
    marginBottom: 40,
  },
  recipeGrid: {
    gap: 12,
  },
  recipeCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 13,
    color: COLORS.textLightGray,
  },
  noRecipesText: {
    fontSize: 14,
    color: COLORS.textLightGray,
    fontStyle: 'italic',
    marginTop: 4,
  },
});