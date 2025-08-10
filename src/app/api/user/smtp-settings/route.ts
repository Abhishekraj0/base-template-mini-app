import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { getUserIdFromRequest } from "~/lib/auth-utils";

// Get user's SMTP settings
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
      .select('smtp_email, smtp_host, smtp_port, smtp_secure')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { configured: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      configured: !!user.smtp_email,
      smtp_email: user.smtp_email,
      smtp_host: user.smtp_host || 'smtp.gmail.com',
      smtp_port: user.smtp_port || 587,
      smtp_secure: user.smtp_secure !== false,
    });
  } catch (error) {
    console.error("Get SMTP settings error:", error);
    return NextResponse.json(
      { error: "Failed to get SMTP settings" },
      { status: 500 }
    );
  }
}

// Save user's SMTP settings
export async function POST(request: NextRequest) {
  try {
    const { smtp_email, smtp_password, smtp_host, smtp_port, smtp_secure } = await request.json();
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!smtp_email || !smtp_password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .update({
        smtp_email,
        smtp_password, // In production, encrypt this
        smtp_host: smtp_host || 'smtp.gmail.com',
        smtp_port: smtp_port || 587,
        smtp_secure: smtp_secure !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to save SMTP settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SMTP settings saved successfully",
    });
  } catch (error) {
    console.error("Save SMTP settings error:", error);
    return NextResponse.json(
      { error: "Failed to save SMTP settings" },
      { status: 500 }
    );
  }
}

// Delete user's SMTP settings
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
        smtp_email: null,
        smtp_password: null,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to delete SMTP settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SMTP settings deleted successfully",
    });
  } catch (error) {
    console.error("Delete SMTP settings error:", error);
    return NextResponse.json(
      { error: "Failed to delete SMTP settings" },
      { status: 500 }
    );
  }
}