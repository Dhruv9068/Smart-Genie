import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, DollarSign, GraduationCap, Briefcase, Users, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileBuilderProps {
  interests: string[];
  onComplete: () => void;
  onBack: () => void;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ 
  interests, 
  onComplete, 
  onBack 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    income: '',
    education: '',
    employment: '',
    familySize: '1',
    location: '',
    specificNeeds: '',
  });
  const { updateProfile } = useAuth();

  const steps = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        {
          name: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'Enter your age',
          icon: User,
        },
        {
          name: 'location',
          label: 'City/State',
          type: 'text',
          placeholder: 'e.g., New York, NY',
          icon: MapPin,
        },
      ],
    },
    {
      title: 'Financial Information',
      icon: DollarSign,
      fields: [
        {
          name: 'income',
          label: 'Annual Income (USD)',
          type: 'number',
          placeholder: 'Enter your annual income',
          icon: DollarSign,
        },
        {
          name: 'familySize',
          label: 'Family Size',
          type: 'select',
          options: [
            { value: '1', label: '1 person' },
            { value: '2', label: '2 people' },
            { value: '3', label: '3 people' },
            { value: '4', label: '4 people' },
            { value: '5+', label: '5+ people' },
          ],
          icon: Users,
        },
      ],
    },
    {
      title: 'Education & Employment',
      icon: GraduationCap,
      fields: [
        {
          name: 'education',
          label: 'Education Level',
          type: 'select',
          options: [
            { value: 'high-school', label: 'High School' },
            { value: 'some-college', label: 'Some College' },
            { value: 'bachelors', label: "Bachelor's Degree" },
            { value: 'masters', label: "Master's Degree" },
            { value: 'doctorate', label: 'Doctorate' },
            { value: 'other', label: 'Other' },
          ],
          icon: GraduationCap,
        },
        {
          name: 'employment',
          label: 'Employment Status',
          type: 'select',
          options: [
            { value: 'employed', label: 'Employed' },
            { value: 'unemployed', label: 'Unemployed' },
            { value: 'student', label: 'Student' },
            { value: 'self-employed', label: 'Self-Employed' },
            { value: 'retired', label: 'Retired' },
            { value: 'other', label: 'Other' },
          ],
          icon: Briefcase,
        },
      ],
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!profile.age || !profile.income || !profile.education || !profile.employment) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      await updateProfile({
        ...profile,
        interests,
        age: parseInt(profile.age),
        income: parseInt(profile.income),
        familySize: parseInt(profile.familySize),
        disabilities: false,
        
      });
      
      toast.success('Profile completed successfully!');
      
      // Small delay to ensure profile is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a page reload to refresh the auth state
      window.location.href = '/';
      
      onComplete();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    return currentStepData.fields.every(field => {
      if (field.type === 'select') return profile[field.name as keyof typeof profile];
      return profile[field.name as keyof typeof profile]?.trim();
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid grid-hover-effect">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-lg border-2 border-orange-200 flex items-center justify-center">
            <img src="/Logo.png" alt="SchemeGenie" className="w-10 h-10 p-1" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tell us about yourself
          </h1>
          <p className="text-gray-600">
            This helps us find the perfect schemes and automate your applications
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 card-hover-shine">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center mb-6">
                    required
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-orange-200 flex items-center justify-center mr-3">
                <currentStepData.icon className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStepData.title}
              </h2>
            </div>

            <div className="space-y-6">
              {currentStepData.fields.map((field) => (
                <div key={field.name} className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full border border-orange-200 flex items-center justify-center z-10">
                    <field.icon className="h-3 w-3 text-orange-600" />
                  </div>
                  {field.type === 'select' ? (
                    <Select
                      label={field.label}
                      value={profile[field.name as keyof typeof profile]}
                      onChange={(e) => setProfile(prev => ({ ...prev, [field.name]: e.target.value }))}
                      options={field.options || []}
                      className="pl-12"
                    />
                  ) : (
                    <Input
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={profile[field.name as keyof typeof profile]}
                      onChange={(e) => setProfile(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="pl-12"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </Card>

        <div className="flex justify-between mt-8">
          <Button
            onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)}
            variant="outline"
            disabled={loading}
            className="flex items-center rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            loading={loading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center rounded-xl"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};