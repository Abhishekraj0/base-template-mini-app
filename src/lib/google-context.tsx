"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface GoogleContextType {
  user: GoogleUser | null;
  accessToken: string | null;
  isConnected: boolean;
  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  loading: boolean;
}

const GoogleContext = createContext<GoogleContextType | undefined>(undefined);

// Load Google Identity Services script
const loadGoogleScript = () => {
  return new Promise<void>((resolve) => {
    if (document.getElementById('google-identity-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google credentials from database when user is authenticated
    if (authUser) {
      fetchUserGoogleConnection();
    } else {
      setUser(null);
      setAccessToken(null);
    }
  }, [authUser]);

  const fetchUserGoogleConnection = async () => {
    try {
      if (!authUser?.id) return;
      
      const response = await fetch('/api/user/google-connection', {
        headers: {
          'x-user-id': authUser.id,
          'authorization': `Bearer token_${authUser.id}_${Date.now()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.connected) {
          setUser({
            id: data.google_id,
            email: data.google_email,
            name: data.google_name,
            picture: data.google_picture,
          });
          setAccessToken(data.google_access_token);
        }
      }
    } catch (error) {
      console.error('Error fetching Google connection:', error);
    }
  };

  const connectGoogle = async () => {
    try {
      setLoading(true);
      await loadGoogleScript();

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('Google Client ID not configured - Google integration will be disabled');
        setLoading(false);
        return;
      }

      // Initialize Google Identity Services
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      // Request OAuth token for calendar access
      const tokenClient = window.google?.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: handleTokenResponse,
      });

      tokenClient?.requestAccessToken();

    } catch (error) {
      console.error('Google connection error:', error);
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    // This handles the ID token response
    console.log('Google ID response:', response);
  };

  const handleTokenResponse = async (response: any) => {
    if (response.access_token) {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`
        );
        const userInfo = await userInfoResponse.json();

        // Save to database
        const saveResponse = await fetch('/api/user/google-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': authUser?.id || '',
            'authorization': `Bearer token_${authUser?.id}_${Date.now()}`,
          },
          body: JSON.stringify({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            user_info: userInfo,
          }),
        });

        if (saveResponse.ok) {
          setUser({
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          });
          setAccessToken(response.access_token);
        }
      } catch (error) {
        console.error('Error saving Google connection:', error);
      }
    }
    setLoading(false);
  };

  const disconnectGoogle = async () => {
    try {
      if (!authUser?.id) return;
      
      const response = await fetch('/api/user/google-connection', {
        method: 'DELETE',
        headers: {
          'x-user-id': authUser.id,
          'authorization': `Bearer token_${authUser.id}_${Date.now()}`,
        },
      });

      if (response.ok) {
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error);
    }
  };

  return (
    <GoogleContext.Provider
      value={{
        user,
        accessToken,
        isConnected: !!user && !!accessToken,
        connectGoogle,
        disconnectGoogle,
        loading,
      }}
    >
      {children}
    </GoogleContext.Provider>
  );
}

export function useGoogle() {
  const context = useContext(GoogleContext);
  if (context === undefined) {
    throw new Error('useGoogle must be used within a GoogleProvider');
  }
  return context;
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}