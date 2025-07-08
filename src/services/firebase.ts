import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { FIREBASE_CONFIG, MOCK_SCHEMES_DATA } from '../utils/constants';
import { User as AppUser, Scheme, UserProfile } from '../utils/types';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export class FirebaseService {
  // Initialize auth state listener
  initAuthListener(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as AppUser);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Authentication methods
  async signUp(email: string, password: string, userData: Partial<AppUser>): Promise<AppUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const appUser: AppUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || '',
        country: userData.country || 'US',
        language: userData.language || 'en',
        profile: userData.profile || {
          age: 0,
          income: 0,
          education: '',
          employment: '',
          familySize: 1,
          disabilities: false,
          gender: '',
          location: '',
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), appUser);
      return appUser;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as AppUser;
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { profile }, { merge: true });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Schemes methods
  async getSchemes(country?: string, category?: string): Promise<Scheme[]> {
    try {
      // For demo purposes, return mock data
      // In production, this would query Firestore
      let schemes = [...MOCK_SCHEMES_DATA] as Scheme[];

      if (country) {
        schemes = schemes.filter(scheme => scheme.country === country);
      }

      if (category) {
        schemes = schemes.filter(scheme => scheme.category === category);
      }

      return schemes;
    } catch (error) {
      console.error('Get schemes error:', error);
      return [];
    }
  }

  async addScheme(scheme: Scheme): Promise<void> {
    try {
      await setDoc(doc(db, 'schemes', scheme.id), scheme);
    } catch (error) {
      console.error('Add scheme error:', error);
      throw error;
    }
  }

  // Reminders methods
  async addReminder(reminder: any): Promise<void> {
    try {
      await setDoc(doc(db, 'reminders', reminder.id), reminder);
    } catch (error) {
      console.error('Add reminder error:', error);
      throw error;
    }
  }

  async getUserReminders(userId: string): Promise<any[]> {
    try {
      const remindersQuery = query(
        collection(db, 'reminders'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(remindersQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get reminders error:', error);
      return [];
    }
  }
}

export const firebaseService = new FirebaseService();