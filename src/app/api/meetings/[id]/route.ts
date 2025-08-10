import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error("Get meeting error:", error);
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

    const { data: updatedMeeting, error } = await supabase
      .from('meetings')
      .update({
        ...updateData,
        duration: updateData.duration ? parseInt(updateData.duration) : 60,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error("Update meeting error:", error);
      return NextResponse.json(
        { error: "Failed to update meeting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Meeting updated successfully",
      meeting: updatedMeeting,
    });
  } catch (error) {
    console.error("Update meeting error:", error);
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
      .from('meetings')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error("Delete meeting error:", error);
      return NextResponse.json(
        { error: "Failed to delete meeting" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Delete meeting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}