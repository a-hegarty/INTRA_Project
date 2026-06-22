import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
// @ts-ignore
import { COLORS } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthAction = async () => {
    setErrorMsg('');
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Please fill out all fields.');
      return;
    }
    if (isRegistering && !emailInput.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    
    setLoading(true);

    const result = isRegistering 
      ? await register(usernameInput.trim(), emailInput.trim(), passwordInput.trim())
      : await login(usernameInput.trim(), passwordInput.trim());

    setLoading(false);
    if (result.success) {
      // Go back to the profile screen where they came from
      router.replace('/profile');
    } else {
      setErrorMsg(result.error || 'Authentication failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Sign up to keep your diet choices synced.' : 'Log in to view your favorite meals.'}
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter username" 
            value={usernameInput} 
            onChangeText={setUsernameInput} 
            autoCapitalize="none"
            placeholderTextColor="#A0A0A0"
          />
        </View>
        
        {isRegistering && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="you@example.com" 
              value={emailInput} 
              onChangeText={setEmailInput} 
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••••••" 
            value={passwordInput} 
            onChangeText={setPasswordInput} 
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleAuthAction} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff"/>
          ) : (
            <Text style={styles.primaryBtnText}>{isRegistering ? 'Sign Up' : 'Log In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}>
          <Text style={styles.switchText}>
            {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel & Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: '#FAFAFA' 
  },
  card: {
    padding: 24,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#FAFAFA',
    fontSize: 16,
    color: '#1C1C1E'
  },
  errorText: { 
    color: '#FF3B30', 
    marginBottom: 12, 
    textAlign: 'center',
    fontWeight: '500'
  },
  primaryBtn: { 
    height: 50, 
    backgroundColor: '#1C3A27', // Updated to match the navigation bar in your screenshot
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 8 
  },
  primaryBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  switchText: { 
    textAlign: 'center', 
    marginTop: 20, 
    color: '#1C3A27', // Updated to match the navigation bar in your screenshot
    fontWeight: '600' 
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontSize: 14,
  }
});