import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Lock, UserPlus } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: user =', user, 'loading =', loading, 'requireProfile =', requireProfile);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid grid-hover-effect pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-4 card-hover-shine">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-orange-200 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign up or login to access this feature and discover personalized government schemes.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up / Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireProfile && (!user.profile?.interests || !user.profile?.age)) {
    console.log('ProtectedRoute: Profile incomplete, redirecting to home');
    return (
      <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid grid-hover-effect pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-4 card-hover-shine">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-orange-200 flex items-center justify-center mx-auto mb-6">
              <img src="/Logo.png" alt="SchemeGenie" className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Please complete your profile setup to access personalized scheme recommendations.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};