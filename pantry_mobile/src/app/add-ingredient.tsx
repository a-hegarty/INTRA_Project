import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
// @ts-ignore
import { COLORS, FONTS } from '../../theme';
import { useAuth, PantryIngredient } from '../context/AuthContext';

const UNITS = ['kg', 'g', 'liters', 'ml', 'cups', 'oz', 'lbs', 'pieces', 'tbsp', 'tsp'];

export default function AddIngredient() {
  const router = useRouter();
  const { addIngredient } = useAuth();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expiryDate, setExpiryDate] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const handleAddIngredient = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter ingredient name');
      return;
    }
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }

    // Validate and format expiry date (DD-MM-YYYY to YYYY-MM-DD for storage)
    let formattedExpiryDate = null;
    if (expiryDate.trim()) {
      const parts = expiryDate.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        formattedExpiryDate = `${year}-${month}-${day}`;
      } else {
        Alert.alert('Error', 'Please use DD-MM-YYYY format for expiry date');
        return;
      }
    }

    const newIngredient: PantryIngredient = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit: unit,
      expiryDate: formattedExpiryDate,
      addedDate: new Date().toISOString().split('T')[0],
    };

    addIngredient(newIngredient);
    Alert.alert('Success', `${name} added to pantry!`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Ingredient</Text>

        {/* Ingredient Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ingredient Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chicken, Milk, Rice"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2, 0.5, 10"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>

        {/* Unit Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Unit of Measurement</Text>
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() => setShowUnitDropdown(!showUnitDropdown)}
          >
            <Text style={styles.unitButtonText}>{unit}</Text>
            <Text style={styles.unitButtonArrow}>▼</Text>
          </TouchableOpacity>

          {showUnitDropdown && (
            <View style={styles.dropdown}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.dropdownItem, unit === u && styles.dropdownItemActive]}
                  onPress={() => {
                    setUnit(u);
                    setShowUnitDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, unit === u && styles.dropdownItemTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Expiry Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Expiry Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="DD-MM-YYYY"
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholderTextColor="#999"
          />
          <Text style={styles.helperText}>Format: 20-06-2026</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
          <Text style={styles.addButtonText}>Add to Pantry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  unitButtonArrow: {
    fontSize: 12,
    color: '#999',
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemActive: {
    backgroundColor: '#e8f5e9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
