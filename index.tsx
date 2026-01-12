
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { User, UserRole, UserPreferences, UserSettings } from './types';
import { db } from './services/db';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import AppContent from './App';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  // Persist user sessions locally
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setActiveTab('home');
  };

  const handleOnboardingComplete = (primaryMessId: string, prefs: UserPreferences) => {
    if (!user) return;
    const updatedUser: User = { 
      ...user, 
      hasCompletedOnboarding: true, 
      primaryMessId, 
      preferences: prefs,
      settings: {
        notifications: { lunchReminders: true, dinnerReminders: true, weeklyReports: false },
        darkMode: false
      }
    };
    db.updateUser(updatedUser);
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
  };

  const handleUpdateSettings = (settings: UserSettings) => {
    if (!user) return;
    const updatedUser = { ...user, settings };
    db.updateUser(updatedUser);
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
  };

  if (!user) return <Auth onAuthSuccess={handleAuthSuccess} />;
  
  if (!user.hasCompletedOnboarding) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppContent 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onUpdateSettings={handleUpdateSettings}
    />
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
