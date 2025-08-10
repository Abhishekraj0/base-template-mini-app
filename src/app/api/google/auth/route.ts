import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Get Google OAuth URL
export async function GET() {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return NextResponse.json({
      authUrl,
    });
  } catch (error) {
    console.error("Google OAuth URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}

// Handle OAuth callback
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    return NextResponse.json({
      success: true,
      tokens,
      userInfo: userInfo.data,
    });

  } catch (error) {
    console.error("Google OAuth token exchange error:", error);
    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 500 }
    );
  }
}