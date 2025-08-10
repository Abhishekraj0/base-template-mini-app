"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Input, Select, Textarea } from "~/components/ui/input";
import { Logo } from "~/components/ui/Logo";
import { useTheme } from "~/lib/theme-context";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  location: string;
  bio: string;
  avatar_url: string;
  timezone: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  created_at: string;
}

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'email' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { theme, setTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  const [preferences, setPreferences] = useState({
    language: "en",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [smtpData, setSmtpData] = useState({
    smtp_email: "",
    smtp_password: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_secure: true,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchSmtpSettings();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you'd get the current user ID from authentication context
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          company: data.company || "",
          designation: data.designation || "",
          location: data.location || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
        setPreferences({
          language: data.language || "en",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const requestData = {
        ...preferences,
        theme,
      };
      
      console.log('Saving preferences:', requestData);
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('Preferences save result:', result);

      if (response.ok) {
        setMessage("✅ Preferences updated successfully!");
        // Apply language change immediately (in a real app, this would trigger UI language change)
        document.documentElement.lang = preferences.language;
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Failed to update preferences: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Preferences save error:', error);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage("New passwords don't match!");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage("Password must be at least 6 characters long!");
      return;
    }

    setSaving(true);
    setMessage("");
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (response.ok) {
        setMessage("Password changed successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to change password. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fetchSmtpSettings = async () => {
    try {
      // Get current user from localStorage (in a real app, use proper auth context)
      const storedUser = localStorage.getItem('ansluta_user');
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      
      const response = await fetch('/api/user/smtp-settings', {
        headers: {
          'x-user-id': userData.id,
          'authorization': `Bearer token_${userData.id}_${Date.now()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.configured) {
          setSmtpData({
            smtp_email: data.smtp_email || "",
            smtp_password: "", // Don't populate password for security
            smtp_host: data.smtp_host || "smtp.gmail.com",
            smtp_port: data.smtp_port || 587,
            smtp_secure: data.smtp_secure !== false,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching SMTP settings:", error);
    }
  };

  const handleSmtpSave = async () => {
    if (!smtpData.smtp_email || !smtpData.smtp_password) {
      setMessage("Email and password are required for SMTP configuration.");
      return;
    }

    setSaving(true);
    setMessage("");
    
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem('ansluta_user');
      if (!storedUser) {
        setMessage("❌ Authentication required. Please log in again.");
        setSaving(false);
        return;
      }
      
      const userData = JSON.parse(storedUser);
      
      const response = await fetch('/api/user/smtp-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userData.id,
          'authorization': `Bearer token_${userData.id}_${Date.now()}`,
        },
        body: JSON.stringify(smtpData),
      });

      if (response.ok) {
        setMessage("✅ Email settings saved successfully! You can now send meeting invitations.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setMessage(`❌ Failed to save email settings: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Logo size="md" className="mr-4" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes("successfully") 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-red-100 text-red-700 border border-red-200"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                      
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                      
                      <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="+91 9876543210"
                      />
                      
                      <Input
                        label="Company"
                        name="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                        placeholder="Your company name"
                      />
                      
                      <Input
                        label="Designation"
                        name="designation"
                        value={profileData.designation}
                        onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                        placeholder="Your job title"
                      />
                      
                      <Input
                        label="Location"
                        name="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <Textarea
                        label="Bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleProfileSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      <Select
                        label="Language"
                        name="language"
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        options={[
                          { value: "en", label: "🇺🇸 English" },
                          { value: "hi", label: "🇮🇳 हिन्दी (Hindi)" },
                          { value: "es", label: "🇪🇸 Español (Spanish)" },
                          { value: "fr", label: "🇫🇷 Français (French)" },
                          { value: "de", label: "🇩🇪 Deutsch (German)" },
                          { value: "ja", label: "🇯🇵 日本語 (Japanese)" },
                          { value: "zh", label: "🇨🇳 中文 (Chinese)" },
                          { value: "ar", label: "🇸🇦 العربية (Arabic)" },
                          { value: "pt", label: "🇧🇷 Português (Portuguese)" },
                          { value: "ru", label: "🇷🇺 Русский (Russian)" },
                          { value: "ko", label: "🇰🇷 한국어 (Korean)" },
                          { value: "it", label: "🇮🇹 Italiano (Italian)" },
                        ]}
                      />
                      
                      <Select
                        label="Theme"
                        name="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                        options={[
                          { value: "light", label: "🌞 Light Mode" },
                          { value: "dark", label: "🌙 Dark Mode" },
                          { value: "auto", label: "🔄 Auto (System)" },
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Current Settings</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <div><strong>Language:</strong> {preferences.language.toUpperCase()}</div>
                      <div><strong>Theme:</strong> {theme.charAt(0).toUpperCase() + theme.slice(1)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePreferencesSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                      {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </div>
              )}



              {/* Email Settings Tab */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
                    <p className="text-gray-600 mb-6">Configure your email settings to send meeting invitations and notifications.</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">📧 Gmail Setup Instructions</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>1. Enable 2-factor authentication on your Gmail account</p>
                        <p>2. Go to Google Account settings → Security → App passwords</p>
                        <p>3. Generate an app password for "Mail"</p>
                        <p>4. Use your Gmail address and the generated app password below</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      <Input
                        label="Email Address"
                        type="email"
                        name="smtp_email"
                        value={smtpData.smtp_email}
                        onChange={(e) => setSmtpData({...smtpData, smtp_email: e.target.value})}
                        placeholder="your-email@gmail.com"
                        required
                      />
                      
                      <Input
                        label="App Password"
                        type="password"
                        name="smtp_password"
                        value={smtpData.smtp_password}
                        onChange={(e) => setSmtpData({...smtpData, smtp_password: e.target.value})}
                        placeholder="Your Gmail app password"
                        required
                      />
                      
                      <Input
                        label="SMTP Host"
                        name="smtp_host"
                        value={smtpData.smtp_host}
                        onChange={(e) => setSmtpData({...smtpData, smtp_host: e.target.value})}
                        placeholder="smtp.gmail.com"
                      />
                      
                      <Input
                        label="SMTP Port"
                        type="number"
                        name="smtp_port"
                        value={smtpData.smtp_port.toString()}
                        onChange={(e) => setSmtpData({...smtpData, smtp_port: parseInt(e.target.value) || 587})}
                        placeholder="587"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={smtpData.smtp_secure}
                          onChange={(e) => setSmtpData({...smtpData, smtp_secure: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Use secure connection (TLS)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSmtpSave}
                      disabled={saving || !smtpData.smtp_email || !smtpData.smtp_password}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Email Settings"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Update your account password to keep your account secure.</p>
                    
                    <div className="max-w-md space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        placeholder="Enter current password"
                      />
                      
                      <Input
                        label="New Password"
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        placeholder="Enter new password (min 6 characters)"
                      />
                      
                      <Input
                        label="Confirm New Password"
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                      >
                        {saving ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}