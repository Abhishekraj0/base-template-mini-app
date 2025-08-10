import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET() {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: leads || [],
      count: leads?.length || 0,
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      phone, 
      company, 
      category,
      salary_min,
      salary_max,
      budget_range,
      industry,
      location,
      notes,
      status 
    } = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create new lead in Supabase
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          company: company || null,
          category: category || 'individual',
          salary_min: salary_min ? parseFloat(salary_min) : null,
          salary_max: salary_max ? parseFloat(salary_max) : null,
          budget_range: budget_range || 'low',
          industry: industry || null,
          location: location || null,
          notes: notes || null,
          status: status || 'new',
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Lead created successfully",
      lead: newLead,
    });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}