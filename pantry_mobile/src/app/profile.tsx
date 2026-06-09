import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
// @ts-ignore
import { COLORS } from '../../theme';

const DIETARY_FILTERS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Dairy-Free', 'Nut-Free'];

export default function ProfilePage() {
  const { username, dietaryRestrictions, toggleDiet, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Link href="/" style={styles.backLink}>⬅️ Back to Pantry</Link>

        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <Text style={styles.sectionSubtitle}>Tap filters to apply them dynamically.</Text>
          
          <View style={styles.grid}>
            {DIETARY_FILTERS.map((diet, index) => {
              const isActive = dietaryRestrictions.includes(diet);
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.checkboxCard, isActive && styles.checkboxCardActive]}
                  onPress={() => toggleDiet(diet)}
                >
                  <View style={[styles.checkbox, isActive && styles.checkboxActive]} />
                  <Text style={[styles.checkboxLabel, isActive && styles.checkboxLabelActive]}>{diet}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    marginBottom: 24,
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
});