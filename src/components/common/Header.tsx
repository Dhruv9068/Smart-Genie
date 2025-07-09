import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  const handleNavClick = (href: string) => {
    // Check if route requires authentication
    const protectedRoutes = ['/assistant', '/schemes', '/dashboard'];
    
    if (protectedRoutes.includes(href) && !user) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if route requires completed profile
    if (protectedRoutes.includes(href) && user && (!user.profile?.interests || !user.profile?.age)) {
      window.location.href = '/';
      return;
    }
    
    window.location.href = href;
  };
  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.assistant'), href: '/assistant' },
    { name: t('nav.schemes'), href: '/schemes' },
    { name: t('nav.dashboard'), href: '/dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
      >
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
          <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-full shadow-lg px-8 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-10 h-10 bg-cream-200 rounded-full shadow-md flex items-center justify-center"
                >
                  <img src="/Logo.png" alt="SchemeGenie" className="w-7 h-7" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  SchemeGenie
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
                      isActive(item.href)
                        ? 'text-orange-600 bg-orange-50 shadow-sm'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <LanguageSelector />
                
                <Button
                  onClick={() => window.open('https://your-site.com/schemegenie_extension.zip', '_blank')}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center space-x-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full"
                >
                  <Download className="h-4 w-4" />
                  <span>Extension</span>
                </Button>
              
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </button>
                  
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1"
                      >
                        <button
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-full mx-1"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full"
                    size="sm"
                  >
                    Login
                  </Button>
                )}

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-orange-100 pt-4 mt-4"
              >
                <nav className="space-y-2">
                  {[
                    {name: t('nav.home'), href: '/'},
                    {name: 'AI Assistant', href: '/assistant'},
                    {name: 'Browse Schemes', href: '/schemes'},
                    {name: 'Dashboard', href: '/dashboard'},
                    {name: 'Download Extension', href: 'https://your-site.com/schemegenie_extension.zip'},
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (item.href.startsWith('http')) {
                          window.open(item.href, '_blank');
                        } else {
                          handleNavClick(item.href);
                        }
                      }}
                      className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-full ${
                        isActive(item.href)
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      } w-full text-left`}
                    >
                      {item.name}
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};