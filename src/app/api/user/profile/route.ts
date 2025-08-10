import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    // In a real app, you'd get the user ID from authentication context
    // For demo purposes, we'll get the first user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userProfile } = user;

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();

    // In a real app, you'd get the user ID from authentication context
    // For demo purposes, we'll update the first user
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = users[0].id;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        company: updateData.company,
        designation: updateData.designation,
        location: updateData.location,
        bio: updateData.bio,
        avatar_url: updateData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password, ...userProfile } = updatedUser;

    return NextResponse.json({
      message: "Profile updated successfully",
      user: userProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}