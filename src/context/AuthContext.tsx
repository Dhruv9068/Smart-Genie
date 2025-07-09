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
    // Initialize Firebase auth listener
    const unsubscribe = firebaseService.initAuthListener((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await firebaseService.signIn(email, password);
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
      await firebaseService.updateUserProfile(user.id, profile);
      const updatedUser = { 
        ...user, 
        profile: { 
          ...user.profile, 
          ...profile,
          interests: profile.interests || user.profile?.interests
        } 
      };
      setUser(updatedUser);
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