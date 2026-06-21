import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
// @ts-ignore
import { COLORS, FONTS } from '../../theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

export default function CreateRecipe() {
  const router = useRouter();
  const { username } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [allDbIngredients, setAllDbIngredients] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/ingredients/`)
      .then(r => r.json())
      .then(data => setAllDbIngredients(data.map((i: any) => typeof i === 'string' ? i : i.name)))
      .catch(() => {});
  }, []);

  const suggestions = ingredientInput.trim().length > 0
    ? allDbIngredients.filter(i =>
        i.toLowerCase().includes(ingredientInput.toLowerCase()) &&
        !ingredients.includes(i)
      )
    : [];

  const addIngredient = (name?: string) => {
    const trimmed = (name ?? ingredientInput).trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (item: string) => {
    setIngredients(prev => prev.filter(i => i !== item));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!name.trim()) { setErrorMsg('Recipe name is required.'); return; }
    if (!time.trim()) { setErrorMsg('Cooking time is required.'); return; }
    if (ingredients.length === 0) { setErrorMsg('Add at least one ingredient.'); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('time', String(parseInt(time) || 0));
      formData.append('calories', String(parseInt(calories) || 0));
      formData.append('protein', String(parseInt(protein) || 0));
      formData.append('carbs', String(parseInt(carbs) || 0));
      formData.append('instructions', instructions.trim());
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('username', username || 'anonymoususer');

      if (imageUri) {
        const filename = imageUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        if (imageUri.startsWith('blob:') || imageUri.startsWith('http')) {
          // Web: fetch the blob from the object URL
          const blobRes = await fetch(imageUri);
          const blob = await blobRes.blob();
          formData.append('image', blob, filename);
        } else {
          // Native: use the RN FormData object format
          formData.append('image', { uri: imageUri, name: filename, type: mimeType } as any);
        }
      }

      const response = await fetch(`${API_BASE_URL}/recipes/create/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.replace('/');
      } else {
        const err = await response.json();
        setErrorMsg(err.error || 'Failed to create recipe.');
      }
    } catch {
      setErrorMsg('Could not connect to server. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Recipe</Text>
        </View>

        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>Tap to add a photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
            <Text style={styles.removeImageText}>Remove photo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Recipe Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Garlic Chicken Stir Fry"
          placeholderTextColor={COLORS.textLightGray}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Cooking Time (minutes) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          placeholderTextColor={COLORS.textLightGray}
          keyboardType="numeric"
          value={time}
          onChangeText={setTime}
        />

        <View style={styles.row}>
          <View style={styles.rowField}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.textLightGray}
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
          </View>
          <View style={styles.rowField}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.textLightGray}
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
          </View>
          <View style={styles.rowField}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.textLightGray}
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
          </View>
        </View>

        <Text style={styles.label}>Ingredients *</Text>
        <View style={styles.ingredientRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. Chicken Breast"
            placeholderTextColor={COLORS.textLightGray}
            value={ingredientInput}
            onChangeText={setIngredientInput}
            onSubmitEditing={() => addIngredient()}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => addIngredient()}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => addIngredient(item)}
              >
                <Text style={styles.suggestionText}>➕ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {ingredients.length > 0 && (
          <View style={styles.pillContainer}>
            {ingredients.map((ing, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{ing}</Text>
                <TouchableOpacity onPress={() => removeIngredient(ing)}>
                  <Text style={styles.pillClose}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Step 1: Heat oil in pan..."
          placeholderTextColor={COLORS.textLightGray}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={instructions}
          onChangeText={setInstructions}
        />

        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Create Recipe</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.backgroundWhite },
  container: { padding: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 16 },
  backButton: { paddingVertical: 4 },
  backText: { fontSize: 16, color: COLORS.primaryGreen, fontWeight: '600' },
  title: {
    fontSize: FONTS.header.fontSize,
    fontWeight: FONTS.header.fontWeight as any,
    color: COLORS.primaryGreen,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  textArea: {
    height: 140,
    paddingTop: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
  ingredientRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: { fontSize: 14, fontWeight: '500', color: COLORS.textGreen, marginRight: 6 },
  pillClose: { fontSize: 16, fontWeight: '600', color: COLORS.textGreen, marginTop: -2 },
  submitBtn: {
    marginTop: 32,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderGray,
    borderStyle: 'dashed',
    marginBottom: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  imagePlaceholderIcon: { fontSize: 36 },
  imagePlaceholderText: { fontSize: 14, color: COLORS.textLightGray, fontWeight: '500' },
  removeImageBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  removeImageText: { fontSize: 13, color: '#CC0000', fontWeight: '500' },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderRadius: 10,
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
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  errorMsg: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCCC',
    color: '#CC0000',
    fontSize: 14,
  },
});
