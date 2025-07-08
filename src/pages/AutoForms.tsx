import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { geminiService } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const AutoForms: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<'select' | 'chat' | 'review' | 'complete'>('select');
  const { user } = useAuth();

  const availableSchemes = [
    {
      id: 'student-aid',
      title: 'Student Financial Aid Program',
      description: 'Financial assistance for university students',
      complexity: 'High',
      timeToFill: '2-3 hours manually',
      aiTime: '5-10 minutes',
    },
    {
      id: 'business-grant',
      title: 'Small Business Grant',
      description: 'Funding for small business development',
      complexity: 'Very High',
      timeToFill: '4-6 hours manually',
      aiTime: '10-15 minutes',
    },
    {
      id: 'housing-subsidy',
      title: 'Housing Subsidy Program',
      description: 'Affordable housing assistance',
      complexity: 'Medium',
      timeToFill: '1-2 hours manually',
      aiTime: '5-8 minutes',
    },
  ];

  const handleSchemeSelect = (schemeId: string) => {
    setSelectedScheme(schemeId);
    setCurrentStep('chat');
    const scheme = availableSchemes.find(s => s.id === schemeId);
    setChatMessages([{
      id: '1',
      text: `Great! I'll help you apply for the ${scheme?.title}. Let me ask you a few simple questions to fill out your application automatically. What's your full name?`,
      isUser: false
    }]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Simulate AI processing the form data
      const prompt = `You are helping fill out a government benefit application form. The user just said: "${currentInput}". 
      
      Based on their response, ask the next relevant question for the application or if you have enough information, 
      let them know the form is being prepared. Keep responses conversational and helpful.
      
      Previous conversation: ${chatMessages.map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`).join('\n')}`;

      const response = await geminiService.generateContent(prompt, 'en');
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // Simulate form completion after several exchanges
      if (chatMessages.length > 8) {
        setTimeout(() => {
          setCurrentStep('review');
          setFormData({
            name: 'John Doe',
            age: 25,
            income: 35000,
            education: 'Bachelor\'s Degree',
            address: '123 Main St, City, State',
            // ... other form fields
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
      toast.error('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitApplication = () => {
    setCurrentStep('complete');
    toast.success('Application submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-cream-50 bg-grid-pattern bg-grid pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full shadow-lg border-2 border-orange-200 flex items-center justify-center">
            <img src="/Logo.png" alt="SchemeGenie" className="w-10 h-10 p-1" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Form Automation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stop wasting hours on complex government forms. Our AI fills them out for you in minutes.
          </p>
        </motion.div>

        {currentStep === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full cursor-pointer" onClick={() => handleSchemeSelect(scheme.id)}>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">{scheme.title}</h3>
                    <p className="text-gray-600 text-sm">{scheme.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Complexity:</span>
                        <span className={`text-sm font-medium ${
                          scheme.complexity === 'High' ? 'text-red-600' :
                          scheme.complexity === 'Very High' ? 'text-red-700' :
                          'text-yellow-600'
                        }`}>
                          {scheme.complexity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Manual Time:</span>
                        <span className="text-sm text-red-600">{scheme.timeToFill}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">AI Time:</span>
                        <span className="text-sm text-green-600 font-medium">{scheme.aiTime}</span>
                      </div>
                      <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                        Start AI Application
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {currentStep === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Form Assistant</h3>
                    <p className="text-sm text-gray-600">Filling out your application automatically</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Type your response..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isProcessing}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
                    <p className="text-sm text-gray-600">AI has automatically filled out your form</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex space-x-4">
                  <Button
                    onClick={() => setCurrentStep('chat')}
                    variant="outline"
                    className="flex-1"
                  >
                    Make Changes
                  </Button>
                  <Button
                    onClick={handleSubmitApplication}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    Submit Application
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your application has been automatically submitted. You'll receive email updates on the status.
              </p>
              <div className="flex space-x-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/applications'}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  View My Applications
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep('select');
                    setSelectedScheme('');
                    setChatMessages([]);
                    setFormData({});
                  }}
                  variant="outline"
                >
                  Apply for Another Scheme
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};