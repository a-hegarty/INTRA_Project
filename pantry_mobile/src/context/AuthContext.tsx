import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  login: (user: string) => void;
  logout: () => void;

  dietaryRestrictions: string[];
  toggleDiet: (diet: string) => void;

  // Global UI data persistence values
  globalIngredients: string[];
  setGlobalIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  globalMissingCount: number;
  setGlobalMissingCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [username, setUsername] = useState('');
  
  // Profile specific state configuration
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  
  // Global persistence hooks
  const [globalIngredients, setGlobalIngredients] = useState<string[]>([]);
  const [globalMissingCount, setGlobalMissingCount] = useState<number>(0);

  const login = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
  };

  const toggleDiet = (diet: string) => {
    if (dietaryRestrictions.includes(diet)) {
      setDietaryRestrictions(dietaryRestrictions.filter(item => item !== diet));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, diet]);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setGlobalIngredients([]);
    setGlobalMissingCount(0);
    setDietaryRestrictions([]);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      username, 
      login, 
      logout,
      dietaryRestrictions,
      toggleDiet,
      globalIngredients, 
      setGlobalIngredients,
      globalMissingCount,
      setGlobalMissingCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};