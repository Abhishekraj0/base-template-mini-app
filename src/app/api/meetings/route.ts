import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { 
  generateGoogleMeetLink, 
  generateZoomLink, 
  generateTeamsLink, 
  generateJitsiLink 
} from "~/lib/calendar-utils";

export async function GET() {
  try {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: true });

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch meetings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      meetings: meetings || [],
      count: meetings?.length || 0,
    });
  } catch (error) {
    console.error("Get meetings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      attendees, 
      meeting_date, 
      meeting_time, 
      duration, 
      platform, 
      status,
      userAccessToken 
    } = await request.json();

    // Validate input
    if (!title || !meeting_date || !meeting_time) {
      return NextResponse.json(
        { error: "Title, date, and time are required" },
        { status: 400 }
      );
    }

    // Generate appropriate meeting link based on platform
    let meeting_link = '';
    switch (platform) {
      case 'google-meet':
        meeting_link = generateGoogleMeetLink();
        break;
      case 'zoom':
        meeting_link = generateZoomLink();
        break;
      case 'teams':
        meeting_link = generateTeamsLink();
        break;
      case 'jitsi':
        meeting_link = generateJitsiLink(title);
        break;
      default:
        meeting_link = generateGoogleMeetLink();
    }

    // Create new meeting in Supabase
    const { data: newMeeting, error: insertError } = await supabase
      .from('meetings')
      .insert([
        {
          title,
          description: description || null,
          attendees: attendees || null,
          meeting_date,
          meeting_time,
          duration: duration || 60,
          meeting_link,
          platform: platform || 'google-meet',
          status: status || 'scheduled',
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create meeting" },
        { status: 500 }
      );
    }

    // If user has Google access token and platform is Google Meet, create calendar event
    if (userAccessToken && platform === 'google-meet') {
      try {
        const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/google/calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meeting: newMeeting,
            userAccessToken,
          }),
        });

        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          
          // Update meeting with Google Calendar event ID and real Meet link
          const { error: updateError } = await supabase
            .from('meetings')
            .update({
              meeting_link: calendarData.meetingLink || meeting_link,
              google_event_id: calendarData.eventId,
            })
            .eq('id', newMeeting.id);

          if (!updateError) {
            newMeeting.meeting_link = calendarData.meetingLink || meeting_link;
            newMeeting.google_event_id = calendarData.eventId;
          }
        }
      } catch (calendarError) {
        console.error("Calendar integration error:", calendarError);
        // Continue without calendar integration
      }
    }

    return NextResponse.json({
      message: "Meeting scheduled successfully",
      meeting: newMeeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}