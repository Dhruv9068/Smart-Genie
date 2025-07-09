import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/gemini';
import { speechService } from '../../services/speech';
import { elevenLabsService } from '../../services/elevenLabs';
import { firebaseService } from '../../services/firebase';
import { ChatMessage } from '../../utils/types';
import { SchemeSelector } from './SchemeSelector';
import toast from 'react-hot-toast';

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [mode, setMode] = useState<'selector' | 'chat'>('selector');
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (mode === 'chat') {
      // Welcome message for chat mode
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: selectedScheme 
          ? `Great! I'll help you with the "${selectedScheme.title}" scheme. I can:\n\n• Explain eligibility requirements\n• Guide you through the application process\n• Help fill out forms automatically\n• Answer specific questions about this scheme\n\nWhat would you like to know about this scheme?`
          : 'Hello! I\'m your SchemeGenie AI assistant. I can help you:\n\n• Find schemes you\'re eligible for\n• Understand eligibility requirements\n• Guide you through application processes\n• Fill out applications automatically\n\nWhat questions do you have about government schemes?',
        isUser: false,
        timestamp: new Date(),
        language: currentLanguage,
      };
      setMessages([welcomeMessage]);
    }
  }, [currentLanguage, mode, selectedScheme]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // Stop any current speech
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsSpeaking(false);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      language: currentLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Enhanced prompt for better scheme assistance
      const enhancedPrompt = selectedScheme 
        ? `You are SchemeGenie AI assistant helping automate the application for "${selectedScheme.title}".
        
        Scheme Details:
        - Title: ${selectedScheme.title}
        - Description: ${selectedScheme.description}
        - Country: ${selectedScheme.country}
        - Category: ${selectedScheme.category}
        - Eligibility: ${selectedScheme.eligibility?.join(', ') || 'Not specified'}
        - Benefits: ${selectedScheme.benefits?.join(', ') || 'Not specified'}
        - Deadline: ${selectedScheme.deadline || 'Not specified'}
        - Website: ${selectedScheme.website || 'Not specified'}
        - Application Process: ${selectedScheme.applicationProcess || 'Standard process'}
        - Amount: ${selectedScheme.amount || 'Varies'}
        
        User question: "${text}"
        
        Your role is to AUTOMATE the application process:
        1. If they ask about requirements: Explain eligibility and help them check if they qualify
        2. If they want to apply: Offer to pre-fill the application form using their profile
        3. If they need documents: List exactly what's needed and help them prepare
        4. If they're ready to submit: Guide them to use our Chrome Extension or direct submission
        
        ALWAYS mention:
        - "I can pre-fill your application form automatically"
        - "Use our Chrome Extension to auto-fill government forms"
        - "I'll save your progress in the dashboard for approval"
        
        Be specific, actionable, and focus on automation.`
        : `You are SchemeGenie AI assistant. The user said: "${text}"
      
      Your role is to:
      1. Help users find eligible government schemes
      2. Guide them through application processes
      3. Provide specific, actionable advice
      4. AUTOMATE application filling process
      
      If they ask about schemes or eligibility, offer to:
      - Show them personalized scheme matches
      - Pre-fill applications automatically using AI
      - Explain requirements and deadlines
      - Use Chrome Extension for government portals
      
      If they want to apply for a scheme, offer to automate the entire process.
      
      ALWAYS mention our automation features:
      - AI pre-fills applications
      - Chrome Extension auto-fills government forms
      - Dashboard for approval and tracking
      
      Keep responses helpful, specific, and focused on automation.`;

      const response = await geminiService.generateContent(enhancedPrompt, currentLanguage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        language: currentLanguage,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak the response if enabled
      if (autoSpeak && !isSpeaking) {
        handleSpeak(response);
      }
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        isUser: false,
        timestamp: new Date(),
        language: currentLanguage,
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!speechService.isSupported()) {
      toast.error('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      speechService.stopListening?.();
      return;
    }

    try {
      setIsListening(true);
      toast.success('Listening... Speak now!');
      
      const transcript = await speechService.startListening(currentLanguage);
      setIsListening(false);
      
      if (transcript && transcript.trim()) {
        toast.success('Voice input captured!');
        handleSendMessage(transcript);
      } else {
        toast.error('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Voice input failed:', error);
      setIsListening(false);
      toast.error('Voice input failed. Please check your microphone.');
    }
  };

  const handleSpeak = async (text: string) => {
    // Stop any current speech first
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsSpeaking(false);
    }
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      
      // Try ElevenLabs first for better quality
      try {
        const audioBlob = await elevenLabsService.generateSpeech(text);
        const audio = new Audio(URL.createObjectURL(audioBlob));
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        await audio.play();
      } catch (elevenLabsError) {
        console.warn('ElevenLabs failed, falling back to browser speech:', elevenLabsError);
        // Fallback to browser speech synthesis
        speechService.stopSpeaking(); // Stop any existing speech
        await speechService.speak(text, currentLanguage);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      setIsSpeaking(false);
      toast.error('Speech output failed');
    }
  };

  const handleContinuousConversation = async () => {
    if (!speechService.isSupported()) {
      toast.error('Voice input is not supported in your browser.');
      return;
    }

    try {
      setIsListening(true);
      toast.success('Continuous conversation mode activated! Speak your question...');
      
      const transcript = await speechService.startListening(currentLanguage);
      setIsListening(false);
      
      if (transcript && transcript.trim()) {
        // Send the message and get AI response
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          text: transcript,
          isUser: true,
          timestamp: new Date(),
          language: currentLanguage,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
          const response = await geminiService.generateContent(transcript, currentLanguage);
          
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date(),
            language: currentLanguage,
          };

          setMessages(prev => [...prev, botMessage]);
          
          // Automatically speak the response
          await handleSpeak(response);
          
        } catch (error) {
          console.error('Failed to get AI response:', error);
          toast.error('Failed to get AI response');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Continuous conversation failed:', error);
      setIsListening(false);
      toast.error('Voice conversation failed');
    }
  };

  const handleSchemeSelect = async (scheme: any) => {
    setSelectedScheme(scheme);
    setMode('chat');
    
    // Save user's interest in this scheme
    if (user) {
      try {
        await firebaseService.saveUserApplication(user.id, {
          schemeId: scheme.id,
          schemeTitle: scheme.title,
          status: 'interested',
          schemeData: scheme
        });
      } catch (error) {
        console.error('Failed to save user interest:', error);
      }
    }
  };

  const handleStartConversation = () => {
    setMode('chat');
    setSelectedScheme(null);
  };

  if (mode === 'selector') {
    return (
      <div className="h-full flex flex-col relative overflow-visible">
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center">
                <img src="/Logo.png" alt="SchemeGenie" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">SchemeGenie AI Assistant</h3>
                <p className="text-xs text-gray-600">Choose how you'd like to get help</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 relative overflow-visible z-10">
          <SchemeSelector 
            onSchemeSelect={handleSchemeSelect}
            onStartConversation={handleStartConversation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Voice Controls Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-orange-100 flex items-center justify-center">
              <img src="/Logo.png" alt="SchemeGenie" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Voice-Enabled AI Assistant</h3>
              <p className="text-xs text-gray-600">Speak naturally or type your questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoSpeak(!autoSpeak)}
              variant="ghost"
              size="sm"
              className={`p-2 ${autoSpeak ? 'text-orange-600 bg-orange-100' : 'text-gray-400'}`}
              title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleContinuousConversation}
              variant="ghost"
              size="sm"
              className={`p-2 ${isListening ? 'text-red-600 bg-red-100 animate-pulse' : 'text-blue-600 bg-blue-100'}`}
              title="Start voice conversation"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex items-start space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser ? 'bg-orange-500 text-white' : 'bg-white border border-orange-100'
                }`}>
                  {message.isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <img src="/Logo.png" alt="SchemeGenie" className="w-5 h-5" />
                  )}
                </div>
                <div className={`px-4 py-3 rounded-lg relative ${
                  message.isUser 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.text.split('\n').map((line, index) => (
                      <div key={index}>
                        {line}
                        {index < message.text.split('\n').length - 1 && <br />}
                      </div>
                    ))}
                  </div>
                  {!message.isUser && (
                    <button
                      onClick={() => handleSpeak(message.text)}
                      disabled={isSpeaking}
                      className={`absolute -right-2 -top-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSpeaking 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Speak message'}
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center">
                <img src="/Logo.png" alt="SchemeGenie" className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
                <LoadingSpinner size="sm" text="Thinking..." />
              </div>
            </div>
          </motion.div>
        )}
        
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-blue-100 border border-blue-200 px-4 py-3 rounded-lg flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-blue-800 text-sm font-medium">Listening... Speak now!</span>
              <Mic className="h-4 w-4 text-blue-600" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question or use voice input..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isListening}
              className="bg-white"
            />
          </div>
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? 'primary' : 'outline'}
            size="md"
            className={`px-3 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading || isListening}
            className="px-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>💡 {selectedScheme ? 'Ask about requirements, deadlines, or application process' : 'Try: "What schemes am I eligible for?"'}</span>
            <button
              onClick={() => setMode('selector')}
              className="text-orange-600 hover:text-orange-700 text-xs underline"
            >
              Change Mode
            </button>
          </div>
          <span className={`flex items-center space-x-1 ${autoSpeak ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className="w-3 h-3 bg-white rounded-full border border-orange-200 flex items-center justify-center">
              <Volume2 className="h-2 w-2" />
            </div>
            <span>Auto-speak {autoSpeak ? 'ON' : 'OFF'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};