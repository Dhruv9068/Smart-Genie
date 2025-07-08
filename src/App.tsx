import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { Schemes } from './pages/Schemes';
import { AutoForms } from './pages/AutoForms';
import { Applications } from './pages/Applications';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-cream-50">
            <Header />
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/auto-forms" element={<AutoForms />} />
              <Route path="/applications" element={<Applications />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;