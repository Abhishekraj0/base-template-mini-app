import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, client_name, budget, status, start_date, end_date } = await request.json();

    // Validate input
    if (!name || !client_name) {
      return NextResponse.json(
        { error: "Project name and client name are required" },
        { status: 400 }
      );
    }

    // Create new project in Supabase
    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description: description || null,
          client_name,
          budget: budget || 0,
          status: status || 'planning',
          start_date: start_date || null,
          end_date: end_date || null,
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}