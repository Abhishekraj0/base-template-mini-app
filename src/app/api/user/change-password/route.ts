import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const { current_password, new_password } = await request.json();

    // Validate input
    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // In a real app, you'd get the user ID from authentication context
    // For demo purposes, we'll update the first user
    const { data: users } = await supabase
      .from('users')
      .select('id, password')
      .limit(1);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify current password (in production, you'd compare hashed passwords)
    if (user.password !== current_password) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password (in production, you'd hash the new password)
    const { error } = await supabase
      .from('users')
      .update({
        password: new_password, // In production: hash this!
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error("Change password error:", error);
      return NextResponse.json(
        { error: "Failed to change password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}