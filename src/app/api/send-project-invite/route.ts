import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { project, lead, compatibility } = await request.json();

    // In a real implementation, you would use an email service like:
    // - SendGrid
    // - Mailgun  
    // - AWS SES
    // - Resend
    
    // For demo purposes, we'll simulate sending an email
    const emailContent = {
      to: lead.email,
      subject: `Project Opportunity: ${project.name}`,
      html: generateProjectInviteHTML(project, lead, compatibility),
    };

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the email content (in production, this would be sent via your email service)
    console.log('📧 Project Invite Email:', emailContent);

    // Here you would integrate with your email service:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: lead.email, name: lead.name }],
          subject: emailContent.subject,
        }],
        from: { email: 'projects@ansluta.com', name: 'Ansluta Projects' },
        content: [{
          type: 'text/html',
          value: emailContent.html,
        }],
      }),
    });
    */

    return NextResponse.json({
      success: true,
      message: "Project invitation sent successfully",
      emailPreview: emailContent,
    });
  } catch (error) {
    console.error("Send project invite error:", error);
    return NextResponse.json(
      { error: "Failed to send project invitation" },
      { status: 500 }
    );
  }
}

function generateProjectInviteHTML(project: any, lead: any, compatibility: number) {
  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return { label: 'Perfect Match', color: '#10b981', emoji: '🎯' };
    if (score >= 70) return { label: 'Great Match', color: '#3b82f6', emoji: '⭐' };
    if (score >= 50) return { label: 'Good Match', color: '#f59e0b', emoji: '👍' };
    return { label: 'Potential Match', color: '#6b7280', emoji: '💡' };
  };

  const compatibilityInfo = getCompatibilityLabel(compatibility);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Opportunity - ${project.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .project-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .compatibility-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
        .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: #6b7280; font-size: 14px; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
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
          <p style="margin: 5px 0 0; opacity: 0.9;">Project Opportunity</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${lead.name},</h2>
          
          <p>We have an exciting project opportunity that matches your profile and expertise. Based on our analysis, you're a strong candidate for this project.</p>
          
          <div class="compatibility-badge" style="background-color: ${compatibilityInfo.color}20; color: ${compatibilityInfo.color}; border: 1px solid ${compatibilityInfo.color}40;">
            ${compatibilityInfo.emoji} ${compatibilityInfo.label} (${compatibility.toFixed(0)}% compatibility)
          </div>
          
          <div class="project-card">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 20px;">${project.name}</h3>
            <p style="color: #6b7280; margin: 10px 0;"><strong>Client:</strong> ${project.client_name}</p>
            <p style="color: #6b7280; margin: 10px 0;"><strong>Budget:</strong> $${project.budget?.toLocaleString()}</p>
            <p style="color: #6b7280; margin: 10px 0;"><strong>Status:</strong> ${project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}</p>
            
            ${project.description ? `<p style="margin-top: 15px;"><strong>Description:</strong></p><p style="color: #4b5563;">${project.description}</p>` : ''}
            
            ${project.start_date ? `<p style="color: #6b7280; margin: 10px 0;"><strong>Expected Start:</strong> ${new Date(project.start_date).toLocaleDateString()}</p>` : ''}
            ${project.end_date ? `<p style="color: #6b7280; margin: 10px 0;"><strong>Expected End:</strong> ${new Date(project.end_date).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div class="highlight">
            <h4 style="margin-top: 0; color: #1e40af;">Why you're a great fit:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Budget Alignment:</strong> Your budget range (${lead.budget_range}) matches this project's scope</li>
              <li><strong>Category Match:</strong> Your profile (${lead.category}) aligns with project requirements</li>
              ${lead.industry ? `<li><strong>Industry Experience:</strong> Your ${lead.industry} background is relevant</li>` : ''}
              ${lead.location ? `<li><strong>Location:</strong> Based in ${lead.location}</li>` : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:projects@ansluta.com?subject=Interest in ${encodeURIComponent(project.name)}&body=Hi, I'm interested in the ${encodeURIComponent(project.name)} project. Please provide more details." class="cta-button">
              📧 Express Interest
            </a>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Review the project details above</li>
            <li>Click "Express Interest" to respond</li>
            <li>We'll schedule a call to discuss further</li>
            <li>If it's a good fit, we'll connect you with the client</li>
          </ol>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            <strong>About Your Profile:</strong><br>
            ${lead.company ? `Company: ${lead.company}<br>` : ''}
            Category: ${lead.category}<br>
            ${lead.salary_min && lead.salary_max ? `Salary Range: $${lead.salary_min.toLocaleString()} - $${lead.salary_max.toLocaleString()}<br>` : ''}
            ${lead.industry ? `Industry: ${lead.industry}<br>` : ''}
          </p>
          
          <p>We look forward to hearing from you!</p>
          <p><strong>The Ansluta Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">This opportunity was sent by <strong>Ansluta</strong></p>
          <p style="margin: 5px 0 0; font-size: 12px;">© 2024 Ansluta. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}