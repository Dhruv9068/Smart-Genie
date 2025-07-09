import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { FIREBASE_CONFIG, REAL_INDIAN_SCHEMES_DATA } from '../utils/constants';
import { User as AppUser, Scheme, UserProfile, SchemeCategory } from '../utils/types';

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
      
      // Get current user data first
      const currentUserDoc = await getDoc(userRef);
      const currentUser = currentUserDoc.data();
      
      // Merge with existing profile
      const updatedProfile = {
        ...currentUser?.profile,
        ...profile,
        updatedAt: new Date()
      };
      
      // Update the entire user document with new profile
      await setDoc(userRef, { 
        ...currentUser,
        profile: updatedProfile
      }, { merge: true });
      
      console.log('Profile updated successfully for user:', userId);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Schemes methods
  async getSchemes(country?: string, category?: string): Promise<Scheme[]> {
    // Convert the data to proper Scheme type with correct category typing
    let schemes: Scheme[] = REAL_INDIAN_SCHEMES_DATA.map(scheme => ({
      ...scheme,
      category: scheme.category as SchemeCategory
    }));
    
    if (country) schemes = schemes.filter(scheme => scheme.country === country);
    if (category) schemes = schemes.filter(scheme => scheme.category === category);
    
    return schemes;
  }

  async getEligibleSchemes(userId: string): Promise<Scheme[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return REAL_INDIAN_SCHEMES_DATA.slice(0, 5).map(scheme => ({
        ...scheme,
        category: scheme.category as SchemeCategory
      }));
    }
    
    const { profile: userProfile, country } = userDoc.data();
    if (!userProfile) {
      return REAL_INDIAN_SCHEMES_DATA.slice(0, 5).map(scheme => ({
        ...scheme,
        category: scheme.category as SchemeCategory
      }));
    }
    
    const eligibleSchemes = REAL_INDIAN_SCHEMES_DATA.filter(scheme => {
      if (userProfile.age <= 25 && scheme.category === 'education') return true;
      if (userProfile.age <= 35 && scheme.title.includes('Research')) return true;
      if (userProfile.income < 50000 && scheme.title.includes('Merit')) return true;
      if (userProfile.employment === 'student' && scheme.category === 'education') return true;
      if (country === 'IN') return true;
      return false;
    }).slice(0, 8);

    return eligibleSchemes.map((scheme, index) => ({
      ...scheme,
      id: `eligible-${scheme.id}-${index}`,
      category: scheme.category as SchemeCategory,
      matchReason: this.getMatchReason(scheme, userProfile),
      priority: this.calculatePriority(scheme, userProfile)
    }));
  }

  private getMatchReason(scheme: any, userProfile: any): string {
    const reasons = [];
    
    if (userProfile.age <= 25 && scheme.category === 'education') {
      reasons.push('Age eligible for education schemes');
    }
    
    if (userProfile.income < 50000 && scheme.title.includes('Merit')) {
      reasons.push('Income within eligibility range');
    }
    
    if (userProfile.employment === 'student' && scheme.category === 'education') {
      reasons.push('Student status matches scheme requirements');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Matches your general profile';
  }

  private calculatePriority(scheme: any, userProfile: any): 'high' | 'medium' | 'low' {
    let score = 0;
    
    // Age match
    if (userProfile.age <= 25 && scheme.category === 'education') score += 3;
    if (userProfile.age >= 18 && userProfile.age <= 35 && scheme.title.includes('Research')) score += 2;
    
    // Income match
    if (userProfile.income < 50000 && scheme.title.includes('Merit')) score += 2;
    
    // Education match
    if (userProfile.education.includes('Bachelor') && scheme.title.includes('Research')) score += 2;
    if (userProfile.education.includes('Master') && scheme.title.includes('Fellowship')) score += 3;
    
    // Employment match
    if (userProfile.employment === 'student' && scheme.category === 'education') score += 2;
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  async getSchemeById(schemeId: string): Promise<any> {
    const scheme = REAL_INDIAN_SCHEMES_DATA.find(s => s.id === schemeId || schemeId.includes(s.id));
    if (!scheme) return null;
    
    return {
      ...scheme,
      category: scheme.category as SchemeCategory,
      detailedDescription: `${scheme.description}\n\nThis government scheme provides financial assistance to eligible candidates.`,
      applicationSteps: [
        'Check eligibility criteria',
        'Gather required documents',
        'Fill application form',
        'Submit before deadline'
      ],
      tips: [
        'Apply early',
        'Double-check information',
        'Keep document copies'
      ]
    };
  }

  async saveUserApplication(userId: string, application: any): Promise<void> {
    try {
      const applicationId = `app_${Date.now()}`;
      await setDoc(doc(db, 'applications', applicationId), {
        ...application,
        userId,
        id: applicationId,
        status: application.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Save application error:', error);
      throw error;
    }
  }

  async getUserApplications(userId: string): Promise<any[]> {
    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(applicationsQuery);
      return querySnapshot.docs.map(docSnapshot => ({ 
        id: docSnapshot.id, 
        ...docSnapshot.data() 
      }));
    } catch (error) {
      console.error('Get user applications error:', error);
      return [];
    }
  }

  async approveApplication(applicationId: string, userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'applications', applicationId), {
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      
      // Also save to approved applications collection for extension access
      await setDoc(doc(db, 'approved_applications', `${userId}_${applicationId}`), {
        userId,
        applicationId,
        approvedAt: new Date(),
        status: 'approved'
      });
    } catch (error) {
      console.error('Approve application error:', error);
      throw error;
    }
  }

  async getApprovedApplications(userId: string): Promise<any[]> {
    try {
      const approvedQuery = query(
        collection(db, 'approved_applications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(approvedQuery);
      
      // Get full application details
      const approvedApps = [];
      for (const docSnapshot of querySnapshot.docs) {
        const approvedData = docSnapshot.data();
        const appDoc = await getDoc(doc(db, 'applications', approvedData.applicationId));
        if (appDoc.exists()) {
          approvedApps.push({
            id: appDoc.id,
            ...appDoc.data(),
            approvedAt: approvedData.approvedAt
          });
        }
      }
      
      return approvedApps;
    } catch (error) {
      console.error('Get approved applications error:', error);
      return [];
    }
  }

  async updateApplicationStatus(applicationId: string, status: string, data?: any): Promise<void> {
    try {
      await setDoc(doc(db, 'applications', applicationId), {
        status,
        updatedAt: new Date(),
        ...data
      }, { merge: true });
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
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

  // Reminders methods (if needed in future)
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
      return querySnapshot.docs.map(docSnapshot => ({ 
        id: docSnapshot.id, 
        ...docSnapshot.data() 
      }));
    } catch (error) {
      console.error('Get reminders error:', error);
      return [];
    }
  }
}

export const firebaseService = new FirebaseService();