import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';
import { geminiService } from '../../services/gemini';
import { speechService } from '../../services/speech';
import { elevenLabsService } from '../../services/elevenLabs';
import { ChatMessage } from '../../utils/types';

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, t } = useLanguage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: 'Hello! I\'m your AI assistant. I can help you discover government benefit schemes, understand eligibility requirements, and guide you through application processes. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      language: currentLanguage,
    };
    setMessages([welcomeMessage]);
  }, [currentLanguage]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

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
      const response = await geminiService.generateContent(text, currentLanguage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        language: currentLanguage,
      };

      setMessages(prev => [...prev, botMessage]);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!speechService.isSupported()) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const transcript = await speechService.startListening(currentLanguage);
      setIsListening(false);
      if (transcript) {
        handleSendMessage(transcript);
      }
    } catch (error) {
      console.error('Voice input failed:', error);
      setIsListening(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(text, currentLanguage);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
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
                  message.isUser ? 'bg-black text-white' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {message.isUser ? <User className="h-4 w-4" /> : (
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-orange-100 flex items-center justify-center">
                      <img src="/Logo.png" alt="SchemeGenie" className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg relative ${
                  message.isUser 
                    ? 'bg-black text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {!message.isUser && (
                    <button
                      onClick={() => handleSpeak(message.text)}
                      className="absolute -right-2 top-2 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
                      title="Speak message"
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
              <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                <LoadingSpinner size="sm" text="Thinking..." />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? 'primary' : 'outline'}
            size="md"
            className="px-3"
            title={isListening ? t('assistant.voice.stop') : t('assistant.voice.start')}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            variant="primary"
            size="md"
            className="px-3"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};