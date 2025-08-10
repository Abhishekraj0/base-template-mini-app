import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetRange = searchParams.get('budget_range');
    const category = searchParams.get('category');
    const minSalary = searchParams.get('min_salary');
    const maxSalary = searchParams.get('max_salary');
    const industry = searchParams.get('industry');

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (budgetRange) {
      query = query.eq('budget_range', budgetRange);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (industry) {
      query = query.ilike('industry', `%${industry}%`);
    }

    if (minSalary) {
      query = query.gte('salary_min', parseFloat(minSalary));
    }

    if (maxSalary) {
      query = query.lte('salary_max', parseFloat(maxSalary));
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch filtered leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: leads || [],
      count: leads?.length || 0,
      filters: {
        budget_range: budgetRange,
        category,
        min_salary: minSalary,
        max_salary: maxSalary,
        industry,
      },
    });
  } catch (error) {
    console.error("Filter leads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}