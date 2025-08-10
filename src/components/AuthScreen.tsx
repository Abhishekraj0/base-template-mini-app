"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/lib/auth-context";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          if (data.requiresVerification) {
            setMessage("Sign up successful! Please check your email to verify your account before signing in.");
            // Reset form but don't log in or navigate
            setFormData({ name: "", username: "", email: "", password: "" });
          } else {
            setMessage("Sign up successful! Welcome to Ansluta!");
            // Automatically log the user in after signup
            login({
              id: data.user.id,
              username: data.user.username,
              name: data.user.name,
              email: data.user.email,
            });
            // Reset form
            setFormData({ name: "", username: "", email: "", password: "" });
            // Call success callback to navigate to main app
            onAuthSuccess();
          }
        } else {
          setMessage("Sign in successful!");
          // Login the user
          login({
            id: data.user.id,
            username: data.user.username,
            name: data.user.name,
            email: data.user.email,
          });
          // Reset form
          setFormData({ name: "", username: "", email: "", password: "" });
          // Call success callback
          onAuthSuccess();
        }
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Ansluta
        </h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            {isSignUp ? "Are You New" : "Welcome Back"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required={isSignUp}
            />
          )}
          
          <Input
            label={isSignUp ? "Username" : "Username or Email"}
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder={isSignUp ? "Enter your username" : "Enter your username or email"}
            required
          />
          
          {isSignUp && (
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required={isSignUp}
            />
          )}
          
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? "Loading..." : (isSignUp ? "Sign UP!" : "sign in")}
          </Button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("successful") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
              setFormData({ name: "", username: "", email: "", password: "" });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "New user? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}