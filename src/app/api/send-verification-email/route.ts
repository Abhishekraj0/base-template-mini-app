import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Ensure this runs on Node.js (Nodemailer won't work on Edge runtime)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, verificationToken, isWelcome = false } = body ?? {};

    if (!email || !name || (!isWelcome && !verificationToken)) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, verificationToken (when not welcome)" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(
      verificationToken || ""
    )}`;

    const emailContent = {
      to: email,
      subject: isWelcome ? "Welcome to Ansluta!" : "Verify your Ansluta account",
      html: isWelcome
        ? generateWelcomeEmailHTML(name)
        : generateVerificationEmailHTML(name, verificationUrl),
    };

    // Only attempt SMTP when creds are present
    const hasSmtp =
      !!process.env.SYSTEM_SMTP_EMAIL && !!process.env.SYSTEM_SMTP_PASSWORD;

    if (hasSmtp) {
      // Parse env with sane defaults
      const host = process.env.SYSTEM_SMTP_HOST || "smtp.gmail.com";
      const port = Number(process.env.SYSTEM_SMTP_PORT || 587);
      // For port 465 use secure=true; for 587 use secure=false (STARTTLS)
      const secure =
        typeof process.env.SYSTEM_SMTP_SECURE === "string"
          ? process.env.SYSTEM_SMTP_SECURE === "true"
          : port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.SYSTEM_SMTP_EMAIL,
          pass: process.env.SYSTEM_SMTP_PASSWORD,
        },
      });

      // Optional: verify connection config (useful during setup)
      // await transporter.verify();

      await transporter.sendMail({
        from: `"Ansluta" <${process.env.SYSTEM_SMTP_EMAIL}>`,
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      console.log(`✅ ${isWelcome ? "Welcome" : "Verification"} email sent to ${email}`);
      return NextResponse.json({
        success: true,
        message: `${isWelcome ? "Welcome" : "Verification"} email sent successfully`,
      });
    }

    // Fallback to log if SMTP not configured
    console.log(
      `📧 ${isWelcome ? "Welcome" : "Verification"} Email (SMTP not configured):`,
      emailContent
    );

    return NextResponse.json({
      success: true,
      message: `${isWelcome ? "Welcome" : "Verification"} email logged (SMTP not configured)`,
      emailPreview: emailContent,
    });
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

function generateWelcomeEmailHTML(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Ansluta!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .feature-list { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
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
          <h1 style="margin: 0; font-size: 28px;">Welcome to Ansluta!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Your account is ready to use</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p>Welcome to Ansluta! Your account has been successfully created and you're ready to start managing your business more efficiently.</p>
          
          <div class="feature-list">
            <h3 style="margin-top: 0; color: #1f2937;">What you can do now:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>✨ <strong>Manage Leads:</strong> Track and categorize your potential clients</li>
              <li>📊 <strong>Project Management:</strong> Monitor project progress and budgets</li>
              <li>📅 <strong>Meeting Scheduler:</strong> Schedule meetings with automatic email invitations</li>
              <li>⚙️ <strong>Email Integration:</strong> Configure your email settings for seamless communication</li>
              <li>🔗 <strong>Google Calendar:</strong> Connect your Google account for enhanced meeting management</li>
            </ul>
          </div>
          
          <p>To get started:</p>
          <ol>
            <li>Sign in to your account</li>
            <li>Configure your email settings in the Settings page</li>
            <li>Connect your Google account for calendar integration (optional)</li>
            <li>Start adding your leads and projects</li>
          </ol>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out!</p>
          
          <p>Happy organizing!</p>
          <p><strong>The Ansluta Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This email was sent by <strong>Ansluta</strong></p>
          <p style="margin: 5px 0 0; font-size: 12px;">© 2024 Ansluta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateVerificationEmailHTML(name: string, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Ansluta Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .verify-button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #6b7280; font-size: 14px; }
        .security-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
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
          <h1 style="margin: 0; font-size: 28px;">Welcome to Ansluta!</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Verify your email to get started</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p>Thank you for signing up for Ansluta! To complete your registration and start managing your leads, projects, and meetings, please verify your email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="verify-button">✅ Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <div class="security-note">
            <p style="margin: 0; font-size: 14px;"><strong>🔒 Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with Ansluta, you can safely ignore this email.</p>
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>✨ Manage leads with advanced categorization</li>
            <li>📊 Track projects with budget insights</li>
            <li>📅 Schedule meetings with automatic invitations</li>
            <li>⚙️ Customize your account settings</li>
          </ul>
          
          <p>Welcome aboard!</p>
          <p><strong>The Ansluta Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This email was sent by <strong>Ansluta</strong></p>
          <p style="margin: 5px 0 0; font-size: 12px;">© 2024 Ansluta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}