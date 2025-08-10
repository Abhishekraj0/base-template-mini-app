import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    console.log("Testing Supabase connection...");
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error("Supabase connection error:", error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        message: "Database connection failed. Make sure you've run the schema setup SQL in Supabase."
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      data: data
    });
  } catch (error) {
    console.error("Test DB error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to connect to database"
    });
  }
}