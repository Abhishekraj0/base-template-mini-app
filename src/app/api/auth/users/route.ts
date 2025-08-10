import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    // Fetch users from Supabase without passwords for security
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, name, created_at');

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      count: users?.length || 0,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}