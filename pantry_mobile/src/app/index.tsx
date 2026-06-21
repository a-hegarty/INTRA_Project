import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';
import { Link } from 'expo-router';
// @ts-ignore 
import { COLORS, FONTS } from '../../theme'; 
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, BackendRecipe } from '../constants/api';

type IngredientDetail = {
  name: string;
  quantity: string;
  measurement: string;
  expiryDate: string;
};

const MEASUREMENT_OPTIONS = ['pcs', 'g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'oz', 'lb'];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allDatabaseIngredients, setAllDatabaseIngredients] = useState<string[]>([]);
  const [recipesDatabase, setRecipesDatabase] = useState<BackendRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredientDetails, setIngredientDetails] = useState<IngredientDetail[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: '', measurement: 'pcs', expiryDate: '' });
  
  const { 
    username, 
    globalIngredients, 
    setGlobalIngredients,
    globalMissingCount,
    setGlobalMissingCount,
    favoriteRecipeIds,
    toggleFavoriteRecipe,
    dietaryRestrictions,
  } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [ingResponse, recipeResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/ingredients/`),
          fetch(`${API_BASE_URL}/recipes/`)
        ]);

        if (ingResponse.ok) {
          const ingData = await ingResponse.json();
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

  const uniqueTags = Array.from(
    new Set(recipesDatabase.flatMap(recipe => recipe.tags || []))
  );

  const toggleTagSelection = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const filteredSuggestions = allDatabaseIngredients.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !globalIngredients.includes(item)
  );

  const addIngredient = (name: string) => {
    setGlobalIngredients([...globalIngredients, name]);
    setIngredientDetails(prev => [...prev, { name, quantity: '', measurement: 'pcs', expiryDate: '' }]);
    setSearchQuery('');
  };

  const saveIngredientFromModal = () => {
    const trimmed = form.name.trim();
    if (!trimmed || globalIngredients.includes(trimmed)) return;
    setGlobalIngredients([...globalIngredients, trimmed]);
    setIngredientDetails(prev => [...prev, { ...form, name: trimmed }]);
    setForm({ name: '', quantity: '', measurement: 'pcs', expiryDate: '' });
    setModalVisible(false);
  };

  const removeIngredient = (name: string) => {
    setGlobalIngredients(globalIngredients.filter(item => item !== name));
    setIngredientDetails(prev => prev.filter(i => i.name !== name));
  };

  const matchingRecipes = recipesDatabase.filter(recipe => {
    const recipeDiets = recipe.diets || [];
    const satisfiesProfileDiets = dietaryRestrictions.every(diet =>
      recipeDiets.some(rd => rd.toLowerCase() === diet.toLowerCase())
    );
    if (!satisfiesProfileDiets) return false;

    const recipeTags = recipe.tags || [];
    const satisfiesSelectedTags = selectedTags.every(tag =>
      recipeTags.includes(tag)
    );
    if (!satisfiesSelectedTags) return false;

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
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Ingredient</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Chicken"
              placeholderTextColor={COLORS.textLightGray}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />

            <View style={styles.modalRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.modalLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2"
                  placeholderTextColor={COLORS.textLightGray}
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={v => setForm(f => ({ ...f, quantity: v }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 2 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {MEASUREMENT_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.unitChip, form.measurement === opt && styles.unitChipActive]}
                        onPress={() => setForm(f => ({ ...f, measurement: opt }))}
                      >
                        <Text style={[styles.unitChipText, form.measurement === opt && styles.unitChipTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <Text style={styles.modalLabel}>Expiry Date</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={COLORS.textLightGray}
              keyboardType="numeric"
              maxLength={10}
              value={form.expiryDate}
              onChangeText={v => {
                const digits = v.replace(/\D/g, '');
                let formatted = digits;
                if (digits.length >= 3 && digits.length <= 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                } else if (digits.length > 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
                }
                setForm(f => ({ ...f, expiryDate: formatted }));
              }}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveIngredientFromModal}>
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Your Ingredients ({globalIngredients.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pillContainer}>
            {ingredientDetails.map((ing, index) => (
              <View key={index} style={styles.pill}>
                <View>
                  <Text style={styles.pillText}>{ing.name}</Text>
                  {(ing.quantity || ing.expiryDate) ? (
                    <Text style={styles.pillMeta}>
                      {ing.quantity ? `${ing.quantity} ${ing.measurement}` : ''}
                      {ing.quantity && ing.expiryDate ? '  ·  ' : ''}
                      {ing.expiryDate ? `Exp: ${ing.expiryDate}` : ''}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => removeIngredient(ing.name)}>
                  <Text style={styles.pillClose}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {uniqueTags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionHeader}>Filter by Tags</Text>
            <View style={styles.pillContainer}>
              {uniqueTags.map((tag, index) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    onPress={() => toggleTagSelection(tag)}
                  >
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>
                Max Missing Ingredients{' '}
                <Text style={styles.sliderValue}>{globalMissingCount}</Text>
              </Text>
              <Text style={styles.sliderSubtitle}>Updates live as you adjust recipe strictness</Text>
            </View>
          </View>
          
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
          <View style={styles.recipesHeaderRow}>
            <Text style={styles.sectionHeader}>Matching Recipes ({matchingRecipes.length})</Text>
            {dietaryRestrictions.length > 0 && (
              <Text style={styles.dietLabel}>
                Filtered for: {dietaryRestrictions.join(', ')}
              </Text>
            )}
          </View>
          {matchingRecipes.length > 0 ? (
            <View style={styles.recipeGrid}>
              {matchingRecipes.map(recipe => {
                const recipeIngs = recipe.ingredients.map((ing: any) => typeof ing === 'string' ? ing : ing.name);
                const missingList = recipeIngs.filter(ing => !globalIngredients.includes(ing));
                const isFavorite = favoriteRecipeIds.includes(recipe.id);
                
                return (
                  <View key={recipe.id} style={styles.recipeCard}>
                    <Link 
                      href={{
                        pathname: "/recipe-view",
                        params: { 
                          id: String(recipe.id),
                          name: recipe.name,
                          time: recipe.time || '40',
                          instructions: recipe.instructions || '',
                          ingredientsList: JSON.stringify(recipeIngs),
                          calories: recipe.calories || '0',
                          protein: recipe.protein || '0',
                          carbs: recipe.carbs || '0',
                          image_url: recipe.image_url || '',
                        }
                      }} 
                      asChild
                    >
                      <TouchableOpacity style={styles.recipeCardLink}>
                        {recipe.image_url ? (
                          <Image
                            source={{ uri: recipe.image_url }}
                            style={styles.recipeImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.recipeImagePlaceholder}>
                            <Text style={styles.imageIcon}>🍳</Text>
                          </View>
                        )}

                        <View style={styles.recipeMetaContainer}>
                          <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
                          
                          <View style={styles.metricsRow}>
                            <Text style={styles.metricText}>⏱️ {recipe.time || '--'} min</Text>
                            <Text style={styles.metricText}>🔥 {recipe.calories || '--'} cal</Text>
                            <Text style={styles.metricText}>💪 {recipe.protein || '--'}g pro</Text>
                          </View>

                          <Text style={styles.recipeDetails}>
                            <Text style={{ color: missingList.length > 0 ? '#FF9500' : COLORS.textGreen, fontWeight: '600' }}>
                              Missing Ingredients: {missingList.length}
                            </Text>
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavoriteRecipe(recipe.id)}
                      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>
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
    marginBottom: 24 
  },
  tagsSection: {
    marginBottom: 32
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  tagPillSelected: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  tagPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  tagPillTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
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
    marginBottom: 4,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  sliderSubtitle: {
    fontSize: 13,
    color: COLORS.textLightGray,
    marginTop: 4,
    marginBottom: 12,
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
  recipesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 4,
  },
  dietLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    textTransform: 'uppercase',
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
  recipeCardLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  favoriteButton: {
    paddingLeft: 10,
    paddingVertical: 8,
  },
  favoriteIcon: {
    fontSize: 22,
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
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '400',
  },
  pillMeta: {
    fontSize: 11,
    color: COLORS.textLightGray,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: COLORS.textDark,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    backgroundColor: '#F5F5F5',
  },
  unitChipActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLightGray,
  },
  modalSave: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});