import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Link, useRouter } from 'expo-router';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    isLoggedIn, 
    username, 
    globalIngredients, 
    removeIngredient,
    globalMissingCount,
    setGlobalMissingCount 
  } = useAuth();

  // Helper function to format YYYY-MM-DD to DD-MM-YYYY
  const formatDateForDisplay = (dateStr: string | null) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Helper function to convert YYYY-MM-DD to Date for comparison
  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  // Filter dropdown suggestions based on user typing
  const ingredientNames = globalIngredients.map(ing => ing.name);
  const filteredSuggestions = ALL_DATABASE_INGREDIENTS.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !ingredientNames.includes(item)
  );

  const matchingRecipes = RECIPES_DATABASE.filter(recipe => {
    const matchingCount = recipe.ingredients.filter(
      ing => ingredientNames.includes(ing)
    ).length;

    const missingForThisRecipe = recipe.ingredients.length - matchingCount;

    const hasAtLeastOneMatch = matchingCount > 0;
    const passesSliderThreshold = missingForThisRecipe <= globalMissingCount;

    return hasAtLeastOneMatch && passesSliderThreshold;
  });

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = parseDate(expiryDate);
    if (!expiry) return false;
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = parseDate(expiryDate);
    if (!expiry) return false;
    return expiry < today;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Navigation bar */}
        <View style={styles.navBar}>
          <Text style={styles.welcomeUser}>Hi, {username} </Text>
          {isLoggedIn ? (
            <Link href="/profile" style={styles.navLink}>Profile</Link>
          ) : (
            <Link href="/login" style={styles.navLink}>Login</Link>
          )}
        </View>
        
        {/* Main Title Section */}
        <Text style={styles.mainTitle}>Pantry</Text>
        <Text style={styles.subtitle}>What's in your kitchen?</Text>
        <Text style={styles.description}>Add your ingredients and we'll find healthy meals</Text>

        {/* Add Ingredient Button */}
        <TouchableOpacity 
          style={styles.addIngredientButton}
          onPress={() => router.push('/add-ingredient')}
        >
          <Text style={styles.addIngredientButtonText}>+ Add Ingredient</Text>
        </TouchableOpacity>

        {/* Ingredients Section Container */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionHeader}>Your Ingredients ({globalIngredients.length})</Text>
          {globalIngredients.length > 0 ? (
            <View style={styles.ingredientsList}>
              {globalIngredients.map((ingredient) => (
                <View key={ingredient.id} style={[
                  styles.ingredientCard,
                  isExpired(ingredient.expiryDate) && styles.ingredientCardExpired,
                  isExpiringSoon(ingredient.expiryDate) && styles.ingredientCardExpiring
                ]}>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientDetails}>
                      {ingredient.quantity} {ingredient.unit}
                      {ingredient.expiryDate && ` • Expires: ${formatDateForDisplay(ingredient.expiryDate)}`}
                    </Text>
                    {isExpired(ingredient.expiryDate) && (
                      <Text style={styles.expiredLabel}>⚠️ EXPIRED</Text>
                    )}
                    {isExpiringSoon(ingredient.expiryDate) && !isExpired(ingredient.expiryDate) && (
                      <Text style={styles.expiringLabel}>⚡ Expiring Soon</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeIngredient(ingredient.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noIngredientsText}>No ingredients added yet. Start by clicking "Add Ingredient"!</Text>
          )}
        </View>

        {globalIngredients.length > 0 && (
          <>
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
                    const missingList = recipe.ingredients.filter(ing => !ingredientNames.includes(ing));
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
          </>
        )}

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
    marginBottom: 16,
  },
  addIngredientButton: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  addIngredientButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  ingredientsList: {
    gap: 10,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f0f8f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryGreen,
  },
  ingredientCardExpiring: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#FF9500',
  },
  ingredientCardExpired: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
    opacity: 0.7,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  ingredientDetails: {
    fontSize: 13,
    color: COLORS.textLightGray,
    marginTop: 2,
  },
  expiringLabel: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    marginTop: 4,
  },
  expiredLabel: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 24,
    color: COLORS.textLightGray,
    fontWeight: '300',
  },
  noIngredientsText: {
    fontSize: 14,
    color: COLORS.textLightGray,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGreen,
    textDecorationLine: 'underline',
  },
  welcomeUser: {
    marginRight: 'auto',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
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