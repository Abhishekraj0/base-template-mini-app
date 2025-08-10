import { NextRequest, NextResponse } from "next/server";
import { createCalendarInvite } from '~/lib/calendar-utils';
import { supabase } from "~/lib/supabase";
import { getUserIdFromRequest } from "~/lib/auth-utils";

// Dynamically import nodemailer to handle missing dependency gracefully
let nodemailer: any = null;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.warn('nodemailer not installed - email functionality will be disabled');
}

export async function POST(request: NextRequest) {
  try {
    const { meeting, attendeeEmail, attendeeName } = await request.json();
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's SMTP settings
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('smtp_email, smtp_password, smtp_host, smtp_port, smtp_secure, name')
      .eq('id', userId)
      .single();

    if (userError || !user?.smtp_email || !user?.smtp_password) {
      return NextResponse.json(
        {
          error: "SMTP settings not configured. Please configure your email settings in the Settings page to send meeting invitations.",
          needsSmtpSetup: true
        },
        { status: 400 }
      );
    }

    if (!nodemailer) {
      return NextResponse.json(
        {
          error: "Email functionality not available. Please install nodemailer dependency: npm install nodemailer",
          needsDependency: true
        },
        { status: 500 }
      );
    }

    // Create email transporter with user's settings
    const transporter = nodemailer.createTransporter({
      host: user.smtp_host,
      port: user.smtp_port,
      secure: user.smtp_secure,
      auth: {
        user: user.smtp_email,
        pass: user.smtp_password,
      },
    });

    // Generate calendar invite (.ics file)
    const calendarInvite = createCalendarInvite(meeting);

    const emailContent = {
      from: `"${user.name || 'Ansluta'}" <${user.smtp_email}>`,
      to: attendeeEmail,
      subject: `Meeting Invitation: ${meeting.title}`,
      html: generateMeetingInviteHTML(meeting, attendeeName),
      attachments: [
        {
          filename: 'meeting-invite.ics',
          content: calendarInvite,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    };

    // Send email with calendar attachment
    try {
      await transporter.sendMail(emailContent);
      console.log(`✅ Meeting invite sent to ${attendeeEmail}`);

      return NextResponse.json({
        success: true,
        message: "Meeting invitation sent successfully",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email. Please check your SMTP settings.",
          emailError: emailError instanceof Error ? emailError.message : String(emailError)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send meeting invitation" },
      { status: 500 }
    );
  }
}

function generateMeetingInviteHTML(meeting: any, attendeeName: string) {
  const formatDate = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .meeting-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: 600; color: #374151; }
        .value { color: #6b7280; }
        .join-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
              <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.2)" />
              <path d="M30 70 L50 25 L70 70 M35 60 L65 60" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              <circle cx="35" cy="40" r="2" fill="white" opacity="0.8" />
              <circle cx="65" cy="40" r="2" fill="white" opacity="0.8" />
              <circle cx="50" cy="75" r="2" fill="white" opacity="0.8" />
            </svg>
          </div>
          <h1 style="margin: 0; font-size: 28px;">Ansluta</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Meeting Invitation</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${attendeeName},</h2>
          <p>You have been invited to a meeting. Here are the details:</p>
          
          <div class="meeting-details">
            <h3 style="margin-top: 0; color: #1f2937;">${meeting.title}</h3>
            ${meeting.description ? `<p style="color: #6b7280; margin: 10px 0;">${meeting.description}</p>` : ''}
            
            <div class="detail-row">
              <span class="label">📅 Date & Time:</span>
              <span class="value">${formatDate(meeting.meeting_date, meeting.meeting_time)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">⏱️ Duration:</span>
              <span class="value">${meeting.duration} minutes</span>
            </div>
            
            <div class="detail-row">
              <span class="label">💻 Platform:</span>
              <span class="value">${meeting.platform.replace('-', ' ').toUpperCase()}</span>
            </div>
            
            ${meeting.attendees ? `
            <div class="detail-row">
              <span class="label">👥 Attendees:</span>
              <span class="value">${meeting.attendees}</span>
            </div>
            ` : ''}
          </div>
          
          ${meeting.meeting_link ? `
          <div style="text-align: center;">
            <a href="${meeting.meeting_link}" class="join-button">🚀 Join Meeting</a>
          </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Please make sure to join the meeting on time. If you have any questions, feel free to reach out.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This invitation was sent by <strong>Ansluta</strong></p>
          <p style="margin: 5px 0 0; font-size: 12px;">© 2024 Ansluta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}