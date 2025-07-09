import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../utils/types';
import { firebaseService } from '../services/firebase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase auth listener and check localStorage
    const initAuth = async () => {
      // First check localStorage for immediate access
      const storedUser = localStorage.getItem('schemeGenie_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('Loaded user from localStorage:', parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('schemeGenie_user');
        }
      }
      
      // Then set up Firebase listener
      const unsubscribe = firebaseService.initAuthListener((user: User | null) => {
        console.log('Firebase auth state changed:', user);
        setUser(user);
        
        // Update localStorage
        if (user) {
          localStorage.setItem('schemeGenie_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('schemeGenie_user');
        }
        
        setLoading(false);
      });
      
      // If no stored user, still set loading to false after a timeout
      if (!storedUser) {
        setTimeout(() => setLoading(false), 1000);
      } else {
        setLoading(false);
      }
      
      return unsubscribe;
    };

    const unsubscribePromise = initAuth();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Handle demo account
      if (email === 'demo@schemegenie.com' && password === 'demo123') {
        const demoUser = await firebaseService.setupDemoAccount();
        localStorage.setItem('schemeGenie_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }
      
      const userData = await firebaseService.signIn(email, password);
      localStorage.setItem('schemeGenie_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const newUser = await firebaseService.signUp(email, password, userData);
      localStorage.setItem('schemeGenie_user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseService.signOut();
      localStorage.removeItem('schemeGenie_user');
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile: any) => {
    if (!user) return;
    
    try {
      console.log('Updating profile for user:', user.id, 'with data:', profile);
      
      await firebaseService.updateUserProfile(user.id, profile);
      
      // Update local user state immediately
      const updatedUser = { 
        ...user, 
        profile: { 
          ...user.profile, 
          ...profile
        } 
      };
      setUser(updatedUser);
      
      console.log('Profile updated successfully:', updatedUser);
      
      // Store updated user in localStorage for immediate access
      localStorage.setItem('schemeGenie_user', JSON.stringify(updatedUser));
      
      console.log('Auth context: Profile update complete, user state updated');
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};