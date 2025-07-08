import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageCircle, Mic, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ChatBot } from '../components/Assistant/ChatBot';
import { useLanguage } from '../context/LanguageContext';

export const Assistant: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircle,
      title: 'Smart Conversations',
      description: 'Ask questions in natural language and get personalized responses',
    },
    {
      icon: Mic,
      title: 'Voice Support',
      description: 'Speak your questions and hear responses back for accessibility',
    },
    {
      icon: Globe,
      title: 'Multilingual',
      description: 'Get help in your preferred language from our 20+ supported languages',
    },
    {
      icon: Bot,
      title: 'AI Powered',
      description: 'Advanced AI understands your needs and provides accurate guidance',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('assistant.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent companion for discovering and applying to benefit schemes worldwide.
            Ask me anything about government programs, eligibility, or application processes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px]">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full shadow-md border border-orange-100 flex items-center justify-center">
                    <img src="/Logo.png" alt="SchemeGenie" className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">SchemeGenie Assistant</h2>
                    <p className="text-sm text-gray-600">Online and ready to help</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <ChatBot />
              </CardContent>
            </Card>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">How I Can Help</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <p className="text-sm text-gray-600">Find schemes based on your profile</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <p className="text-sm text-gray-600">Explain eligibility requirements</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <p className="text-sm text-gray-600">Guide through application processes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <p className="text-sm text-gray-600">Provide document checklists</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <p className="text-sm text-gray-600">Set up deadline reminders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="cursor-default">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                          <feature.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-gray-600">
                  Be specific about your situation for better recommendations. 
                  For example: "I'm a 25-year-old student in Kenya looking for education funding."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};