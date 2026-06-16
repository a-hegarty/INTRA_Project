import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Link } from 'expo-router';
// @ts-ignore 
import { COLORS, FONTS } from '../../theme'; 
import { useAuth } from '../context/AuthContext';

// Local Django development server URL
const API_BASE_URL = 'http://127.0.0.1:8000';

interface BackendRecipe {
  id: number;
  name: string;
  time?: number;
  instructions?: string;
  ingredients: { id: number; name: string }[] | string[];
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allDatabaseIngredients, setAllDatabaseIngredients] = useState<string[]>([]);
  const [recipesDatabase, setRecipesDatabase] = useState<BackendRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    username, 
    globalIngredients, 
    setGlobalIngredients,
    globalMissingCount,
    setGlobalMissingCount 
  } = useAuth();

  // Fetch ingredients and recipes directly from your local Django API
  useEffect(() => {
    async function fetchData() {
      try {
        const [ingResponse, recipeResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/ingredients/`),
          fetch(`${API_BASE_URL}/recipes/`)
        ]);

        if (ingResponse.ok) {
          const ingData = await ingResponse.json();
          // Maps either array of strings or list of objects from models.Ingredient
          setAllDatabaseIngredients(ingData.map((i: any) => typeof i === 'string' ? i : i.name));
        }
        
        if (recipeResponse.ok) {
          const recipeData = await recipeResponse.json();
          setRecipesDatabase(recipeData);
        }
      } catch (error) {
        console.error("Error fetching data from Django backend:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSuggestions = allDatabaseIngredients.filter(item =>
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

  // Process the list dynamically against ingredients array structures
  const matchingRecipes = recipesDatabase.filter(recipe => {
    const recipeIngs: string[] = recipe.ingredients.map((ing: any) => 
      typeof ing === 'string' ? ing : ing.name
    );
    
    const matchingCount = recipeIngs.filter(
      ing => globalIngredients.includes(ing)
    ).length;

    const missingForThisRecipe = recipeIngs.length - matchingCount;
    const hasAtLeastOneMatch = matchingCount > 0;
    const passesSliderThreshold = missingForThisRecipe <= globalMissingCount;

    return hasAtLeastOneMatch && passesSliderThreshold;
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={{ marginTop: 12, color: COLORS.textLightGray }}>Connecting to Django Database...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.welcomeUser}>Welcome back, {username}</Text>
        
        <Text style={styles.mainTitle}>Pantry</Text>
        <Text style={styles.subtitle}>What's in your kitchen?</Text>
        <Text style={styles.description}>Add your ingredients and we'll find healthy meals</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.labelText}>Search Ingredients</Text>
          <TextInput 
            style={styles.searchBar}
            placeholder="e.g. Chicken, Spinach, Oats" 
            placeholderTextColor={COLORS.textLightGray}
            value={searchQuery}
            onChangeText={setSearchQuery} 
          />

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

        <View style={styles.recipesContainer}>
          <Text style={styles.sectionHeader}>Matching Recipes ({matchingRecipes.length})</Text>
          {matchingRecipes.length > 0 ? (
            <View style={styles.recipeGrid}>
              {matchingRecipes.map(recipe => {
                const recipeIngs = recipe.ingredients.map((ing: any) => typeof ing === 'string' ? ing : ing.name);
                const missingList = recipeIngs.filter(ing => !globalIngredients.includes(ing));
                
                return (
                  <Link 
                    key={recipe.id} 
                    href={{
                      pathname: "/recipe-view",
                      params: { 
                        name: recipe.name,
                        time: recipe.time || '40',
                        instructions: recipe.instructions || '',
                        ingredientsList: JSON.stringify(recipeIngs)
                      }
                    }} 
                    asChild
                  >
                    <TouchableOpacity style={styles.recipeCard}>
                      
                      <View style={styles.recipeImagePlaceholder}>
                        <Text style={styles.imageIcon}>🍳</Text>
                      </View>

                      <View style={styles.recipeMetaContainer}>
                        <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
                        
                        <View style={styles.metricsRow}>
                          <Text style={styles.metricText}>⏱️ {recipe.time || '--'} min</Text>
                          <Text style={styles.metricText}>🔥 -- cal</Text>
                          <Text style={styles.metricText}>💪 --g pro</Text>
                        </View>

                        <Text style={styles.recipeDetails}>
                          <Text style={{ color: missingList.length > 0 ? '#FF9500' : COLORS.textGreen, fontWeight: '600' }}>
                            Missing Ingredients: {missingList.length}
                          </Text>
                        </Text>
                      </View>

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
    backgroundColor: COLORS.backgroundWhite 
  },
  container: { 
    padding: 24, 
    paddingBottom: 120 
  },
  welcomeUser: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textLightGray, 
    marginBottom: 16, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  mainTitle: { 
    fontSize: FONTS.header.fontSize, 
    fontWeight: FONTS.header.fontWeight as any, 
    color: COLORS.primaryGreen, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: FONTS.subheader.fontSize, 
    fontWeight: FONTS.subheader.fontWeight as any, 
    color: COLORS.textGreen, 
    marginBottom: 4 
  },
  description: { 
    fontSize: FONTS.body.fontSize, 
    fontWeight: FONTS.body.fontWeight as any, 
    color: COLORS.textLightGray, 
    marginBottom: 24 
  },
  searchContainer: { 
    marginBottom: 28 
  },
  labelText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textDark, 
    marginBottom: 8 
  },
  searchBar: { 
    height: 50, 
    borderColor: COLORS.borderGray, 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    backgroundColor: '#FAFAFA' 
  },
  ingredientsSection: { 
    marginBottom: 32 
  },
  sectionHeader: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.textDark, 
    marginBottom: 12 
  },
  pillContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  pill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.accentGreen, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  pillText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.textGreen, 
    marginRight: 6 
  },
  pillClose: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textGreen, 
    marginTop: -2 
  },
  sliderSection: { 
    marginBottom: 24 
  },
  sliderHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  sliderValue: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: COLORS.primaryGreen 
  },
  sliderSubtitle: { 
    fontSize: 13, 
    color: COLORS.textLightGray, 
    marginTop: -8, 
    marginBottom: 16 
  },
  slider: { 
    width: '100%', 
    height: 40 
  },
  suggestionsBox: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: COLORS.borderGray, 
    borderRadius: 12, 
    marginTop: 4, 
    maxHeight: 180, 
    overflow: 'hidden' 
  },
  suggestionItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  suggestionText: { 
    fontSize: 14, 
    color: COLORS.textDark, 
    fontWeight: '500' 
  },
  noResultText: { 
    padding: 12, 
    fontSize: 14, 
    color: COLORS.textLightGray, 
    textAlign: 'center' 
  },
  recipesContainer: { 
    marginTop: 8, 
    marginBottom: 40 
  },
  recipeGrid: { 
    gap: 14 
  },
  recipeCard: { 
    flexDirection: 'row', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: COLORS.borderGray, 
    borderRadius: 16, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center' 
  },
  recipeImagePlaceholder: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    backgroundColor: '#F0F0F0', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E5E5' 
  },
  imageIcon: { 
    fontSize: 28 
  },
  recipeMetaContainer: { 
    flex: 1, 
    paddingLeft: 14, 
    justifyContent: 'center' 
  },
  recipeName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.textDark, 
    marginBottom: 6 
  },
  metricsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginBottom: 6 
  },
  metricText: { 
    fontSize: 11, 
    fontWeight: '500', 
    color: COLORS.textLightGray, 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  recipeDetails: { 
    fontSize: 12 
  },
  noRecipesText: { 
    fontSize: 14, 
    color: COLORS.textLightGray, 
    fontStyle: 'italic', 
    marginTop: 4 
  }
});