import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, loading } = useAuth();
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  console.log('ProtectedRoute: user =', user, 'loading =', loading, 'requireProfile =', requireProfile);

  // Auto-login with demo account if no user
  useEffect(() => {
    if (!loading && !user) {
      setShowDemoPrompt(true);
    }
  }, [loading, user]);

  const handleUseDemoAccount = async () => {
    try {
      const { signIn } = useAuth();
      await signIn('demo@schemegenie.com', 'demo123');
      setShowDemoPrompt(false);
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (showDemoPrompt) {
    return (
      <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid grid-hover-effect pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-4 card-hover-shine">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-orange-200 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <img src="/Logo.png" alt="SchemeGenie" className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎬 Demo Mode
            </h2>
            <p className="text-gray-600 mb-4">
              Use demo account to explore SchemeGenie features
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 text-left">
              <p className="text-sm text-orange-800 font-medium mb-1">Demo Account:</p>
              <p className="text-xs text-orange-700">• Pre-loaded with sample applications</p>
              <p className="text-xs text-orange-700">• Works with Chrome Extension</p>
              <p className="text-xs text-orange-700">• Perfect for judges demonstration</p>
            </div>
            <Button
              onClick={handleUseDemoAccount}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl mb-3"
            >
              <img src="/Logo.png" alt="" className="w-4 h-4 mr-2" />
              Use Demo Account
            </Button>
            <Button
              onClick={() => setShowDemoPrompt(false)}
              variant="outline"
              className="w-full rounded-xl text-sm"
            >
              Continue without login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Fixed null check for user
  if (requireProfile && user && (!user.profile?.interests || !user.profile?.age)) {
    console.log('ProtectedRoute: Profile incomplete, redirecting to home');
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};
