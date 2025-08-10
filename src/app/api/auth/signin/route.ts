import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username or email
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`);

    if (findError) {
      console.error("Database find error:", findError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { 
          error: "Please verify your email address before signing in. Check your email for the verification link.",
          requiresVerification: true 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Sign in successful!",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}