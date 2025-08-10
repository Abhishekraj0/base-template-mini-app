import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json();

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        ...updateData,
        budget: updateData.budget ? parseFloat(updateData.budget) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error("Update project error:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error("Delete project error:", error);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}