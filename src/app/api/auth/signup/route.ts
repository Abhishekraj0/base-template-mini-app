import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password } = await request.json();

    // Validate input
    if (!username || !password || !name || !email) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if user already exists (by username or email)
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);

    // If there's an error, it might be a table issue
    if (checkError) {
      console.error("Database check error:", checkError);
      return NextResponse.json(
        { 
          error: "Database error. Make sure the database schema is set up correctly.",
          details: checkError.message 
        },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email address already exists" },
          { status: 409 }
        );
      }
    }

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create new user in Supabase with email verification pending
    // In production, hash the password before storing
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          password, // In production: hash this!
          name,
          email,
          email_verified: false, // Require email verification
          email_verification_token: verificationToken,
          email_verification_expires: tokenExpiry.toISOString(),
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { 
          error: "Failed to create user",
          details: insertError.message,
          hint: insertError.code === '42P01' ? "Table 'users' does not exist. Please run the database schema setup." : insertError.hint
        },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          verificationToken,
          isWelcome: false,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send verification email');
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return NextResponse.json({
      message: "Sign up successful! Please check your email to verify your account.",
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        email_verified: false,
      },
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}