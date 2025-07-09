import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Interest {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const INTERESTS: Interest[] = [
  {
    id: 'education',
    title: 'Education & Training',
    description: 'Scholarships, student loans, skill development programs',
    icon: '🎓',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'business',
    title: 'Business & Entrepreneurship',
    description: 'Startup grants, business loans, entrepreneur support',
    icon: '💼',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'housing',
    title: 'Housing & Real Estate',
    description: 'Home loans, housing subsidies, rental assistance',
    icon: '🏠',
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Wellness',
    description: 'Medical insurance, health programs, disability support',
    icon: '🏥',
    color: 'from-red-400 to-red-600',
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Farming',
    description: 'Farmer subsidies, crop insurance, agricultural loans',
    icon: '🌾',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'employment',
    title: 'Employment & Jobs',
    description: 'Job training, unemployment benefits, career development',
    icon: '💼',
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'women',
    title: 'Women Empowerment',
    description: 'Women-specific schemes, maternal benefits, safety programs',
    icon: '👩',
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: 'elderly',
    title: 'Senior Citizens',
    description: 'Pension schemes, elderly care, senior benefits',
    icon: '👴',
    color: 'from-gray-400 to-gray-600',
  },
];

interface InterestSelectorProps {
  onComplete: (interests: string[]) => void;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({ onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      onComplete(selectedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid grid-hover-effect">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl shadow-lg border-2 border-orange-200 flex items-center justify-center animate-float">
            <img src="/Logo.png" alt="SchemeGenie" className="w-12 h-12 p-1" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What are you looking for?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the areas you're interested in, and we'll help you discover the perfect schemes and automate your applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {INTERESTS.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  selectedInterests.includes(interest.id)
                    ? 'ring-2 ring-orange-500 bg-orange-50 transform scale-105'
                    : 'hover:shadow-lg hover:transform hover:scale-102'
                } card-hover-shine`}
                onClick={() => toggleInterest(interest.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${interest.color} flex items-center justify-center text-2xl`}>
                      <span className="text-white text-xl">{interest.icon}</span>
                    </div>
                    {selectedInterests.includes(interest.id) && (
                      <div className="w-6 h-6 bg-orange-500 rounded-xl flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {interest.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {interest.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-4 text-lg rounded-xl"
          >
            Continue with {selectedInterests.length} selection{selectedInterests.length !== 1 ? 's' : ''}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            You can always change your preferences later
          </p>
        </motion.div>
      </div>
    </div>
  );
};