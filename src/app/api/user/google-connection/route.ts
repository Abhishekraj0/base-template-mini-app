import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { getUserIdFromRequest } from "~/lib/auth-utils";

// Get user's Google connection status
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('google_connected, google_access_token, google_email, google_name, google_picture')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { connected: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      connected: user.google_connected || false,
      google_access_token: user.google_access_token,
      google_email: user.google_email,
      google_name: user.google_name,
      google_picture: user.google_picture,
    });
  } catch (error) {
    console.error("Get Google connection error:", error);
    return NextResponse.json(
      { error: "Failed to get Google connection status" },
      { status: 500 }
    );
  }
}

// Save user's Google connection
export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, user_info } = await request.json();
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('users')
      .update({
        google_connected: true,
        google_access_token: access_token,
        google_refresh_token: refresh_token,
        google_email: user_info.email,
        google_name: user_info.name,
        google_picture: user_info.picture,
        google_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to save Google connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google account connected successfully",
    });
  } catch (error) {
    console.error("Save Google connection error:", error);
    return NextResponse.json(
      { error: "Failed to save Google connection" },
      { status: 500 }
    );
  }
}

// Disconnect user's Google account
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('users')
      .update({
        google_connected: false,
        google_access_token: null,
        google_refresh_token: null,
        google_email: null,
        google_name: null,
        google_picture: null,
        google_connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to disconnect Google account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google account disconnected successfully",
    });
  } catch (error) {
    console.error("Disconnect Google error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google account" },
      { status: 500 }
    );
  }
}