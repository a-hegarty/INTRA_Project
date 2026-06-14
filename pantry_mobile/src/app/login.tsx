import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
// @ts-ignore
import { COLORS } from '../../theme';

export default function LoginPage() {
  const [inputName, setInputName] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await login(inputName);
    router.replace('/'); // Redirect home smoothly
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to sync your custom ingredient pantry across devices.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your username" 
            value={inputName}
            onChangeText={setInputName}
            placeholderTextColor={COLORS.textLightGray} 
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Link href="/" style={styles.backLink}>Go back to Pantry without signing in</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
    justifyContent: 'center',
  },
  container: {
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLightGray,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
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
  },
  loginButton: {
    height: 52,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    color: COLORS.textGreen,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});