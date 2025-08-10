import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';

// Google Calendar API integration
export async function POST(request: NextRequest) {
  try {
    const { meeting, userAccessToken } = await request.json();

    if (!userAccessToken) {
      return NextResponse.json(
        { error: "User not authenticated with Google" },
        { status: 401 }
      );
    }

    // Initialize Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userAccessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create Google Meet link
    const meetingStartTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
    const meetingEndTime = new Date(meetingStartTime.getTime() + (meeting.duration * 60000));

    const event = {
      summary: meeting.title,
      description: meeting.description || '',
      start: {
        dateTime: meetingStartTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: meetingEndTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: meeting.attendees ? 
        meeting.attendees.split(',').map((email: string) => ({ email: email.trim() })) : [],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 }, // 15 minutes before
        ],
      },
    };

    // Create the calendar event with Google Meet
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email invitations to all attendees
    });

    const createdEvent = response.data;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    return NextResponse.json({
      success: true,
      eventId: createdEvent.id,
      meetingLink: meetLink,
      calendarLink: createdEvent.htmlLink,
      event: createdEvent,
    });

  } catch (error) {
    console.error("Google Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

// Update existing calendar event
export async function PUT(request: NextRequest) {
  try {
    const { eventId, meeting, userAccessToken } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userAccessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const meetingStartTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
    const meetingEndTime = new Date(meetingStartTime.getTime() + (meeting.duration * 60000));

    const event = {
      summary: meeting.title,
      description: meeting.description || '',
      start: {
        dateTime: meetingStartTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: meetingEndTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: meeting.attendees ? 
        meeting.attendees.split(',').map((email: string) => ({ email: email.trim() })) : [],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return NextResponse.json({
      success: true,
      event: response.data,
    });

  } catch (error) {
    console.error("Google Calendar update error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

// Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const { eventId, userAccessToken } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userAccessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    return NextResponse.json({
      success: true,
      message: "Calendar event deleted successfully",
    });

  } catch (error) {
    console.error("Google Calendar delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}