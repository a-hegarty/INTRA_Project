import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, BackendRecipe } from '../constants/api';
// @ts-ignore
import { COLORS } from '../../theme';

const DIETARY_FILTERS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Dairy-Free', 'Nut-Free'];

const EQUIPMENT_OPTIONS = [
  'Microwave',
  'Air Fryer',
  'Oven',
  'Stovetop',
  'Slow Cooker',
  'Instant Pot',
  'Blender',
  'Grill',
];

const RECOMMENDATION_PRIORITIES = [
  'Healthy Meals',
  'Low Cost',
  'Reduce Waste',
  'Quick & Easy',
  'High Protein',
  'Family Friendly',
];

function getIngredientNames(recipe: BackendRecipe): string[] {
  return recipe.ingredients.map((ing) => (typeof ing === 'string' ? ing : ing.name));
}

function ToggleGrid({
  items,
  activeItems,
  onToggle,
}: {
  items: string[];
  activeItems: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const isActive = activeItems.includes(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.checkboxCard, isActive && styles.checkboxCardActive]}
            onPress={() => onToggle(item)}
          >
            <View style={[styles.checkbox, isActive && styles.checkboxActive]} />
            <Text style={[styles.checkboxLabel, isActive && styles.checkboxLabelActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProfilePage() {
  const {
    username,
    displayName,
    setDisplayName,
    email,
    setEmail,
    dietaryRestrictions,
    toggleDiet,
    maxCookingTime,
    setMaxCookingTime,
    equipment,
    toggleEquipment,
    recommendationPriorities,
    togglePriority,
    favoriteRecipeIds,
    toggleFavoriteRecipe,
    logout,
  } = useAuth();
  const router = useRouter();
  const [recipesDatabase, setRecipesDatabase] = useState<BackendRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/`);
        if (response.ok) {
          const data = await response.json();
          setRecipesDatabase(data);
        }
      } catch (error) {
        console.error('Error fetching recipes for profile:', error);
      } finally {
        setIsLoadingRecipes(false);
      }
    }
    fetchRecipes();
  }, []);

  const avatarInitial = (displayName || username || '?').charAt(0).toUpperCase();
  const favoriteRecipes = recipesDatabase.filter((recipe) => favoriteRecipeIds.includes(recipe.id));
  const availableToFavorite = recipesDatabase.filter((recipe) => !favoriteRecipeIds.includes(recipe.id));

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.username}>{displayName || username || 'Your Profile'}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionSubtitle}>Your name and contact details.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholderTextColor={COLORS.textLightGray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.textLightGray}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Preferences</Text>
          <Text style={styles.sectionSubtitle}>Help us tailor recipe suggestions to your kitchen.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Max cooking time: {maxCookingTime} min</Text>
            <Slider
              style={styles.slider}
              minimumValue={15}
              maximumValue={120}
              step={15}
              value={maxCookingTime}
              onValueChange={setMaxCookingTime}
              minimumTrackTintColor={COLORS.primaryGreen}
              maximumTrackTintColor={COLORS.borderGray}
              thumbTintColor={COLORS.primaryGreen}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>15 min</Text>
              <Text style={styles.sliderLabelText}>2 hrs</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Kitchen Equipment</Text>
          <Text style={styles.subsectionSubtitle}>Select what you have available at home.</Text>
          <ToggleGrid items={EQUIPMENT_OPTIONS} activeItems={equipment} onToggle={toggleEquipment} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation Priorities</Text>
          <Text style={styles.sectionSubtitle}>What matters most when we suggest meals?</Text>
          <ToggleGrid
            items={RECOMMENDATION_PRIORITIES}
            activeItems={recommendationPriorities}
            onToggle={togglePriority}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <Text style={styles.sectionSubtitle}>Tap filters to apply them dynamically.</Text>
          <ToggleGrid items={DIETARY_FILTERS} activeItems={dietaryRestrictions} onToggle={toggleDiet} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Meals</Text>
          <Text style={styles.sectionSubtitle}>Recipes you marked as favorites from the Pantry.</Text>

          {isLoadingRecipes ? (
            <ActivityIndicator size="small" color={COLORS.primaryGreen} style={{ marginVertical: 16 }} />
          ) : favoriteRecipes.length > 0 ? (
            <View style={styles.favoritesList}>
              {favoriteRecipes.map((recipe) => {
                const recipeIngs = getIngredientNames(recipe);
                return (
                  <View key={recipe.id} style={styles.favoriteCard}>
                    <Link
                      href={{
                        pathname: '/recipe-view',
                        params: {
                          id: String(recipe.id),
                          name: recipe.name,
                          time: String(recipe.time || '40'),
                          instructions: recipe.instructions || '',
                          ingredientsList: JSON.stringify(recipeIngs),
                          calories: String(recipe.calories || '0'),
                          protein: String(recipe.protein || '0'),
                          carbs: String(recipe.carbs || '0'),
                          image_url: recipe.image_url || '',
                        },
                      }}
                      asChild
                    >
                      <TouchableOpacity style={styles.favoriteCardLink}>
                        {recipe.image_url ? (
                          <Image
                            source={{ uri: recipe.image_url }}
                            style={styles.favoriteImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.favoriteImagePlaceholder}>
                            <Text style={styles.favoriteImageIcon}>🍽️</Text>
                          </View>
                        )}
                        <View style={styles.favoriteInfo}>
                          <Text style={styles.favoriteName}>{recipe.name}</Text>
                          <Text style={styles.favoriteMeta}>
                            {recipeIngs.length} ingredients · {recipe.time || '--'} min
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Link>
                    <TouchableOpacity
                      style={styles.removeFavoriteBtn}
                      onPress={() => toggleFavoriteRecipe(recipe.id)}
                    >
                      <Text style={styles.removeFavoriteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyFavorites}>
              <Text style={styles.emptyFavoritesText}>
                No favorites yet — tap the heart on a recipe in the Pantry to save it here.
              </Text>
            </View>
          )}

          {!isLoadingRecipes && availableToFavorite.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Add a favorite</Text>
              <View style={styles.addFavoritesList}>
                {availableToFavorite.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.addFavoriteCard}
                    onPress={() => toggleFavoriteRecipe(recipe.id)}
                  >
                    <Text style={styles.addFavoriteName}>+ {recipe.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
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
    paddingBottom: 48,
  },
  backLink: {
    color: COLORS.textGreen,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  logoutBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFAAAA',
  },
  logoutBtnText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textLightGray,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
    marginTop: 8,
  },
  subsectionSubtitle: {
    fontSize: 13,
    color: COLORS.textLightGray,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: COLORS.textDark,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: COLORS.textLightGray,
  },
  grid: {
    gap: 10,
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  checkboxCardActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F4FAF6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderGray,
    marginRight: 12,
  },
  checkboxActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreen,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  checkboxLabelActive: {
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  favoritesList: {
    gap: 10,
    marginBottom: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    borderRadius: 12,
    backgroundColor: '#F4FAF6',
  },
  favoriteCardLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  favoriteImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  favoriteImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteImageIcon: {
    fontSize: 24,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  favoriteMeta: {
    fontSize: 12,
    color: COLORS.textLightGray,
  },
  removeFavoriteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFAAAA',
  },
  removeFavoriteText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyFavorites: {
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyFavoritesText: {
    fontSize: 14,
    color: COLORS.textLightGray,
    textAlign: 'center',
  },
  addFavoritesList: {
    gap: 8,
  },
  addFavoriteCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  addFavoriteName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textGreen,
  },
});
