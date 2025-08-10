"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      window.opener?.postMessage({
        type: 'GOOGLE_OAUTH_ERROR',
        error,
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Exchange code for tokens
      fetch('/api/google/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.opener?.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              tokens: data.tokens,
              userInfo: data.userInfo,
            }, window.location.origin);
          } else {
            window.opener?.postMessage({
              type: 'GOOGLE_OAUTH_ERROR',
              error: data.error,
            }, window.location.origin);
          }
          window.close();
        })
        .catch(error => {
          console.error('Token exchange error:', error);
          window.opener?.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: 'Token exchange failed',
          }, window.location.origin);
          window.close();
        });
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Google...</p>
      </div>
    </div>
  );
}