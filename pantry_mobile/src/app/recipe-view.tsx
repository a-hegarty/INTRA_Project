import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
// @ts-ignore 
import { COLORS } from '../../theme';
import { useAuth } from '../context/AuthContext';

export default function RecipeViewPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { favoriteRecipeIds, toggleFavoriteRecipe } = useAuth();

  const recipeId = Number(params.id as string) || 0;
  const recipeName = params.name as string || 'Unknown Recipe';
  const cookTime = params.time as string || '40';
  const rawInstructions = params.instructions as string || 'No special cooking steps provided yet.';
  const calories = params.calories as string || '0';
  const protein = params.protein as string || '0';
  const carbs = params.carbs as string || '0';
  const imageUrl = params.image_url as string || '';
  const isFavorite = favoriteRecipeIds.includes(recipeId);
  
  let dynamicIngredients: string[] = [];
  try {
    if (params.ingredientsList) {
      dynamicIngredients = JSON.parse(params.ingredientsList as string);
    }
  } catch (e) {
    dynamicIngredients = ['Error parsing ingredients'];
  }

  const directionsArray = rawInstructions
    .split('\n')
    .map(step => step.trim())
    .filter(step => step.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>⬅️ Back to Pantry</Text>
        </TouchableOpacity>
        {recipeId > 0 && (
          <TouchableOpacity
            style={styles.favoriteHeaderButton}
            onPress={() => toggleFavoriteRecipe(recipeId)}
          >
            <Text style={styles.favoriteHeaderIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text style={styles.favoriteHeaderText}>
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.heroImageContainer}>
            <Text style={styles.heroIcon}>🍽️</Text>
          </View>
        )}

        <View style={styles.detailsContent}>
          
          <Text style={styles.recipeTitle}>{recipeName}</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>⏱️</Text>
              <Text style={styles.metricValue}>{cookTime} min</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>🔥</Text>
              <Text style={styles.metricValue}>{calories} cal</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>💪</Text>
              <Text style={styles.metricValue}>{protein}g pro</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>🍞</Text>
              <Text style={styles.metricValue}>{carbs}g carb</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Ingredients</Text>
          <View style={styles.ingredientsContainer}>
            {dynamicIngredients.length > 0 ? (
              dynamicIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Text style={styles.ingredientDot}>•</Text>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.ingredientText}>No specific items required.</Text>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Cooking Steps</Text>
          
          <View style={styles.stepsContainer}>
            {directionsArray.length > 0 ? (
              directionsArray.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepBodyText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.stepBodyText}>{rawInstructions}</Text>
            )}
          </View>

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
  headerBar: { 
    height: 50, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    backgroundColor: COLORS.backgroundWhite, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  backButton: { 
    paddingVertical: 4 
  },
  backButtonText: { 
    color: COLORS.textGreen, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  favoriteHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  favoriteHeaderIcon: {
    fontSize: 18,
  },
  favoriteHeaderText: {
    color: COLORS.textGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: { 
    paddingBottom: 120 
  },
  heroImage: {
    width: '100%',
    height: 250,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  heroImageContainer: { 
    width: '100%', 
    height: 250, 
    backgroundColor: '#F5F5F5', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomWidth: 1, 
    borderColor: '#E5E5E5' 
  },
  heroIcon: { 
    fontSize: 72 
  },
  detailsContent: { 
    padding: 24 
  },
  recipeTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: COLORS.textDark, 
    marginBottom: 20 
  },
  metricsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 8, 
    marginBottom: 24 
  },
  metricCard: { 
    flex: 1, 
    backgroundColor: '#FAFAFA', 
    borderWidth: 1, 
    borderColor: COLORS.borderGray, 
    borderRadius: 14, 
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  metricEmoji: { 
    fontSize: 18, 
    marginBottom: 4 
  },
  metricValue: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: COLORS.textDark 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#ECEFF1', 
    marginBottom: 24 
  },
  sectionHeading: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textDark, 
    marginBottom: 16 
  },
  ingredientsContainer: { 
    gap: 8, 
    marginBottom: 24 
  },
  ingredientRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  ingredientDot: { 
    fontSize: 18, 
    color: COLORS.textGreen, 
    marginRight: 10, 
    lineHeight: 20 
  },
  ingredientText: { 
    fontSize: 15, 
    color: '#455A64' 
  },
  stepsContainer: { 
    gap: 18 
  },
  stepRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  stepNumberCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: COLORS.accentGreen, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14, 
    marginTop: 2 
  },
  stepNumberText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: COLORS.textGreen 
  },
  stepBodyText: { 
    flex: 1, 
    fontSize: 15, 
    color: '#455A64', 
    lineHeight: 22 
  }
});
