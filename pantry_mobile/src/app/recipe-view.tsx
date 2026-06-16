import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// @ts-ignore 
import { COLORS } from '../../theme'; 

export default function RecipeViewPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract variables with defaults for unpopulated fields
  const recipeName = params.name as string || 'Unknown Recipe';
  const cookTime = params.time as string || '40';
  const rawInstructions = params.instructions as string || 'No special cooking steps provided yet.';
  
  // Parse incoming array parameters cleanly
  let dynamicIngredients: string[] = [];
  try {
    if (params.ingredientsList) {
      dynamicIngredients = JSON.parse(params.ingredientsList as string);
    }
  } catch (e) {
    dynamicIngredients = ['Error parsing ingredients'];
  }

  // Split Django's TextField onto clean string arrays for your list layout block
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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroImageContainer}>
          <Text style={styles.heroIcon}>🍽️</Text>
        </View>

        <View style={styles.detailsContent}>
          
          <Text style={styles.recipeTitle}>{recipeName}</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>⏱️</Text>
              <Text style={styles.metricValue}>{cookTime} min</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>🔥</Text>
              <Text style={styles.metricValue}>-- cal</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>💪</Text>
              <Text style={styles.metricValue}>--g pro</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>🍞</Text>
              <Text style={styles.metricValue}>--g carb</Text>
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
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    backgroundColor: COLORS.backgroundWhite, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  backButton: { 
    alignSelf: 'flex-start', 
    paddingVertical: 4 
  },
  backButtonText: { 
    color: COLORS.textGreen, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  scrollContainer: { 
    paddingBottom: 120 
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