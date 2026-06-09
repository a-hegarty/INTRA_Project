import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isLoggedIn: boolean;
  username: string;
  dietaryRestrictions: string[];
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleDiet: (diet: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Anonymous Chef');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // Load saved session on app startup
  useEffect(() => {
    async function loadStorageData() {
      const savedUser = await AsyncStorage.getItem('@user_name');
      const savedDiets = await AsyncStorage.getItem('@user_diets');
      if (savedUser) {
        setUsername(savedUser);
        setIsLoggedIn(true);
      }
      if (savedDiets) {
        setDietaryRestrictions(JSON.parse(savedDiets));
      }
    }
    loadStorageData();
  }, []);

  const login = async (user: string) => {
    const cleanUser = user.trim() || 'Anonymous Chef';
    await AsyncStorage.setItem('@user_name', cleanUser);
    setUsername(cleanUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user_name');
    await AsyncStorage.removeItem('@user_diets');
    setUsername('Anonymous Chef');
    setDietaryRestrictions([]);
    setIsLoggedIn(false);
  };

  const toggleDiet = async (diet: string) => {
    let updatedDiets = [...dietaryRestrictions];
    if (updatedDiets.includes(diet)) {
      updatedDiets = updatedDiets.filter(d => d !== diet);
    } else {
      updatedDiets.push(diet);
    }
    await AsyncStorage.setItem('@user_diets', JSON.stringify(updatedDiets));
    setDietaryRestrictions(updatedDiets);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, dietaryRestrictions, login, logout, toggleDiet }}>
      {" "}{children}{" "}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}