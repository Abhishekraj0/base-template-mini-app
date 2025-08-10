"use client";

import { useState, useEffect } from "react";
import { AuthScreen } from "~/components/AuthScreen";
import { Navigation } from "~/components/Navigation";
import { LeadsScreen } from "~/components/LeadsScreen";
import { ProjectsScreen } from "~/components/ProjectsScreen";
import { MeetingsScreen } from "~/components/MeetingsScreen";
import { SettingsScreen } from "~/components/SettingsScreen";
import { useAuth } from "~/lib/auth-context";
import { GoogleProvider } from "~/lib/google-context";

type Screen = 'auth' | 'leads' | 'projects' | 'meetings' | 'settings';

export function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('leads');
  const { isAuthenticated, logout, loading } = useAuth();

  useEffect(() => {
    // If not authenticated, show auth screen
    if (!isAuthenticated && !loading) {
      setCurrentScreen('auth');
    } else if (isAuthenticated && currentScreen === 'auth') {
      setCurrentScreen('leads'); // Default to leads screen after login
    }
  }, [isAuthenticated, loading, currentScreen]);

  const handleAuthSuccess = () => {
    setCurrentScreen('leads'); // Default to leads screen after login
  };

  const handleScreenChange = (screen: Screen) => {
    if (screen === 'auth') {
      logout();
      setCurrentScreen('auth');
    } else {
      setCurrentScreen(screen);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-300">Loading Ansluta...</p>
        </div>
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'leads':
        return <LeadsScreen />;
      case 'projects':
        return <ProjectsScreen />;
      case 'meetings':
        return <MeetingsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    <GoogleProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
        <Navigation 
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
          isAuthenticated={isAuthenticated}
        />
        <div className="flex-1">
          {renderCurrentScreen()}
        </div>
      </div>
    </GoogleProvider>
  );
}