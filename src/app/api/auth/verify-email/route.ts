import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.email_verification_expires && new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Email verification update error:", updateError);
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully!",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        email_verified: true,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification - Ansluta</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification</h1>
            <p class="error">Invalid verification link. Please check your email for the correct link.</p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }

    // Verify the token
    const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const result = await verifyResponse.json();

    if (verifyResponse.ok) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified - Ansluta</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #27ae60; }
            .logo { width: 60px; height: 60px; margin: 0 auto 20px; }
            .btn { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3B82F6" />
                    <stop offset="100%" stop-color="#1D4ED8" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
                <path d="M30 70 L50 25 L70 70 M35 60 L65 60" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                <circle cx="35" cy="40" r="2" fill="white" opacity="0.8" />
                <circle cx="65" cy="40" r="2" fill="white" opacity="0.8" />
                <circle cx="50" cy="75" r="2" fill="white" opacity="0.8" />
              </svg>
            </div>
            <h1>Email Verified Successfully!</h1>
            <p class="success">Your email has been verified. You can now sign in to your Ansluta account.</p>
            <a href="/" class="btn">Go to Ansluta</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification Failed - Ansluta</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification Failed</h1>
            <p class="error">${result.error}</p>
            <p>Please try signing up again or contact support if the problem persists.</p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      });
    }
  } catch (error) {
    console.error("Email verification GET error:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Ansluta</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Something went wrong</h1>
          <p class="error">An error occurred while verifying your email. Please try again later.</p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    });
  }
}