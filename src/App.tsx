import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { Schemes } from './pages/Schemes';
import { SchemeDetail } from './pages/SchemeDetail';
import { Dashboard } from './pages/Dashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  // Hide header during onboarding
  const showHeader = !user || (user.profile?.interests && user.profile?.age);
  
  return (
    <Router>
      <div className="min-h-screen bg-cream-50">
        {showHeader && <Header />}
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/scheme/:id" element={<SchemeDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
        </Routes>
        {showHeader && <Footer />}
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;