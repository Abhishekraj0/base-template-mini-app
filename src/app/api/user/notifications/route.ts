import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

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
        email_notifications: updateData.email_notifications,
        push_notifications: updateData.push_notifications,
        marketing_emails: updateData.marketing_emails,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Update notifications error:", error);
      return NextResponse.json(
        { error: "Failed to update notification settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Notification settings updated successfully",
      notifications: {
        email_notifications: updatedUser.email_notifications,
        push_notifications: updatedUser.push_notifications,
        marketing_emails: updatedUser.marketing_emails,
      },
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}