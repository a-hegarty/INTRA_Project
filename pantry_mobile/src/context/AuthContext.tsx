import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/api';

const getSessionItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return await SecureStore.getItemAsync(key);
};

const setSessionItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const deleteSessionItem = async (key: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: string, mail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;

  dietaryRestrictions: string[];
  toggleDiet: (diet: string) => void;

  maxCookingTime: number;
  setMaxCookingTime: React.Dispatch<React.SetStateAction<number>>;
  equipment: string[];
  toggleEquipment: (item: string) => void;
  recommendationPriorities: string[];
  togglePriority: (priority: string) => void;
  favoriteRecipeIds: number[];
  toggleFavoriteRecipe: (id: number) => void;

  globalIngredients: string[];
  setGlobalIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  globalMissingCount: number;
  setGlobalMissingCount: React.Dispatch<React.SetStateAction<number>>;
  userLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toggleListItem = (list: string[], item: string) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userLoaded, setUserLoaded] = useState(false);

  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState(45);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [recommendationPriorities, setRecommendationPriorities] = useState<string[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);

  const [globalIngredients, setGlobalIngredients] = useState<string[]>([]);
  const [globalMissingCount, setGlobalMissingCount] = useState<number>(0);

  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedUser = await getSessionItem('user_session');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUsername(parsed.username);
          setEmail(parsed.email || '');
          setDisplayName(parsed.username);
          setIsLoggedIn(true);
        }

        const storedFavorites = await getSessionItem('user_favorites');
        if (storedFavorites) {
          setFavoriteRecipeIds(JSON.parse(storedFavorites));
        }

        const storedDiets = await getSessionItem('user_diets');
        if (storedDiets) {
          setDietaryRestrictions(JSON.parse(storedDiets));
        }
      } catch (error) {
        console.error("Failed to load session data:", error);
      } finally {
        setUserLoaded(true);
      }
    }
    loadStoredData();
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email || '');
        setDisplayName(data.username);
        setIsLoggedIn(true);

        if (data.favorites) {
          setFavoriteRecipeIds(data.favorites);
          await setSessionItem('user_favorites', JSON.stringify(data.favorites));
        }
        if (data.diets) {
          setDietaryRestrictions(data.diets);
          await setSessionItem('user_diets', JSON.stringify(data.diets));
        }

        await setSessionItem('user_session', JSON.stringify({ username: data.username, email: data.email }));
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Invalid credentials' };
      }
    } catch {
      return { success: false, error: 'Could not connect to backend server' };
    }
  };

  const register = async (user: string, mail: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, email: mail, password: pass })
      });

      if (res.ok) {
        return login(user, pass);
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'Could not connect to backend server' };
    }
  };

  const toggleDiet = async (diet: string) => {
    const updatedDiets = toggleListItem(dietaryRestrictions, diet);
    setDietaryRestrictions(updatedDiets);
    await setSessionItem('user_diets', JSON.stringify(updatedDiets));
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => toggleListItem(prev, item));
  };

  const togglePriority = (priority: string) => {
    setRecommendationPriorities((prev) => toggleListItem(prev, priority));
  };

  const toggleFavoriteRecipe = async (id: number) => {
    const updatedFavorites = favoriteRecipeIds.includes(id)
      ? favoriteRecipeIds.filter((recipeId) => recipeId !== id)
      : [...favoriteRecipeIds, id];
    
    setFavoriteRecipeIds(updatedFavorites);
    await setSessionItem('user_favorites', JSON.stringify(updatedFavorites));
  };

  const logout = async () => {
    try {
      await deleteSessionItem('user_session');
      await deleteSessionItem('user_favorites');
      await deleteSessionItem('user_diets');
    } catch (e) {}
    setIsLoggedIn(false);
    setUsername('');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setGlobalIngredients([]);
    setGlobalMissingCount(0);
    setDietaryRestrictions([]);
    setMaxCookingTime(45);
    setEquipment([]);
    setRecommendationPriorities([]);
    setFavoriteRecipeIds([]);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        username,
        login,
        register,
        logout,
        displayName,
        setEmail,
        password,
        setPassword,
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
        globalIngredients,
        setGlobalIngredients,
        globalMissingCount,
        setGlobalMissingCount,
        userLoaded,
        email,
        setDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};