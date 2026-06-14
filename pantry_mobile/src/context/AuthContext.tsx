import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (user: string) => void;
  logout: () => void;

  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toggleListItem = (list: string[], item: string) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [username, setUsername] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState(45);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [recommendationPriorities, setRecommendationPriorities] = useState<string[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);

  const [globalIngredients, setGlobalIngredients] = useState<string[]>([]);
  const [globalMissingCount, setGlobalMissingCount] = useState<number>(0);

  const login = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    if (!displayName) {
      setDisplayName(user);
    }
  };

  const toggleDiet = (diet: string) => {
    setDietaryRestrictions((prev) => toggleListItem(prev, diet));
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => toggleListItem(prev, item));
  };

  const togglePriority = (priority: string) => {
    setRecommendationPriorities((prev) => toggleListItem(prev, priority));
  };

  const toggleFavoriteRecipe = (id: number) => {
    setFavoriteRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((recipeId) => recipeId !== id) : [...prev, id]
    );
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setDisplayName('');
    setEmail('');
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
        logout,
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
        globalIngredients,
        setGlobalIngredients,
        globalMissingCount,
        setGlobalMissingCount,
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
