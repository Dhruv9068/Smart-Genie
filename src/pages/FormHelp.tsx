import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { geminiService } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import toast, { Toaster } from 'react-hot-toast';

export const FormHelp: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { t, currentLanguage } = useLanguage();

  const mockSchemes = [
    { value: 'student-aid', label: 'Student Financial Aid Program' },
    { value: 'farmer-subsidy', label: 'Farmer Subsidy Scheme' },
    { value: 'women-entrepreneur', label: 'Women Entrepreneur Grant' },
    { value: 'housing-program', label: 'Affordable Housing Program' },
    { value: 'healthcare-access', label: 'Universal Healthcare Access' },
  ];

  const formFields = {
    'student-aid': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'age', label: 'Age', type: 'number', required: true },
      { name: 'university', label: 'University/College', type: 'text', required: true },
      { name: 'course', label: 'Course of Study', type: 'text', required: true },
      { name: 'familyIncome', label: 'Annual Family Income', type: 'number', required: true },
      { name: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true },
    ],
    'farmer-subsidy': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'farmSize', label: 'Farm Size (acres)', type: 'number', required: true },
      { name: 'crops', label: 'Primary Crops', type: 'text', required: true },
      { name: 'experience', label: 'Years of Farming Experience', type: 'number', required: true },
      { name: 'landOwnership', label: 'Land Ownership Type', type: 'select', options: ['Owned', 'Leased', 'Shared'], required: true },
    ],
    'women-entrepreneur': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'businessType', label: 'Type of Business', type: 'text', required: true },
      { name: 'businessStage', label: 'Business Stage', type: 'select', options: ['Idea', 'Startup', 'Established'], required: true },
      { name: 'fundingAmount', label: 'Requested Funding Amount', type: 'number', required: true },
      { name: 'businessPlan', label: 'Business Plan Summary', type: 'textarea', required: true },
    ],
  };

  const handleSchemeChange = (schemeId: string) => {
    setSelectedScheme(schemeId);
    setFormData({});
    setAiSuggestions({});
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const getAiSuggestion = async (fieldName: string, fieldLabel: string) => {
    setLoading(true);
    try {
      const prompt = `Based on the form field "${fieldLabel}" for a ${selectedScheme} application, provide a helpful suggestion or example of what should be entered. Keep the response concise and practical.`;
      
      const suggestion = await geminiService.generateContent(prompt, currentLanguage);
      setAiSuggestions(prev => ({ ...prev, [fieldName]: suggestion }));
      toast.success('AI suggestion generated!');
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      toast.error('Failed to get AI suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const fields = formFields[selectedScheme as keyof typeof formFields] || [];
    const requiredFields = fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(field => field.label),
    };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      toast.error(`Please fill in required fields: ${validation.missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      // In a real app, this would submit the form to the backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast.success('Form submitted successfully! You will receive confirmation via email.');
      setFormData({});
      setAiSuggestions({});
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Form submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentFields = selectedScheme ? formFields[selectedScheme as keyof typeof formFields] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white pt-20">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Smart Form Assistant
            <FileText className="inline-block ml-2 h-8 w-8 text-blue-500" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get AI-powered assistance to fill out benefit application forms correctly and completely.
            Our assistant provides suggestions and validates your entries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Application Form</h2>
                <p className="text-gray-600">Select a scheme and fill out the form with AI assistance</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select
                  label="Select Benefit Scheme"
                  value={selectedScheme}
                  onChange={(e) => handleSchemeChange(e.target.value)}
                  options={[
                    { value: '', label: 'Choose a scheme...' },
                    ...mockSchemes,
                  ]}
                />

                {selectedScheme && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Form loaded for: {mockSchemes.find(s => s.value === selectedScheme)?.label}
                      </p>
                    </div>

                    {currentFields.map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <Button
                            onClick={() => getAiSuggestion(field.name, field.label)}
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            disabled={loading}
                          >
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>

                        {field.type === 'select' ? (
                          <Select
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            options={[
                              { value: '', label: 'Select...' },
                              ...(field.options?.map(opt => ({ value: opt, label: opt })) || []),
                            ]}
                          />
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          />
                        )}

                        {aiSuggestions[field.name] && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">AI Suggestion:</p>
                                <p className="text-sm text-yellow-700">{aiSuggestions[field.name]}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    <div className="pt-4">
                      <Button
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!validateForm().isValid}
                        className="w-full"
                      >
                        Submit Application
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Help Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Form Tips</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Click the help icon next to any field for AI suggestions
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Required fields are marked with a red asterisk (*)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Your form is automatically saved as you type
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Double-check all information before submitting
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Document Upload</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  After form submission, you'll be guided to upload required documents:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Income certificates</li>
                  <li>• Identity documents</li>
                  <li>• Bank statements</li>
                  <li>• Educational certificates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">🤖 AI Assistant</h4>
                <p className="text-sm text-gray-600">
                  Our AI assistant can help you understand form requirements, 
                  provide examples, and ensure you don't miss any important details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};