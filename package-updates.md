# Required Package Updates

**IMPORTANT: Install these dependencies first:**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

**Note:** The app will not work without these dependencies installed!

## Dependencies Added:
- `nodemailer`: Email sending library for meeting invitations
- `@types/nodemailer`: TypeScript types for nodemailer

## Environment Variables Required:

Add these to your `.env.local` file:

```env
# Google Integration (Public Client ID only)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Base URL for API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Google Setup Instructions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized JavaScript origins
6. Copy only the Client ID to your .env file (no client secret needed for client-side OAuth)

## User Setup (Per User):

### Google Integration:
- Users can connect their Google accounts directly through the UI
- No server-side Google credentials needed
- Each user's Google tokens are stored securely in the database

### Email Setup:
- Users configure their own SMTP settings in Settings → Email Settings
- Supports Gmail with app passwords
- Each user can use their own email for sending meeting invitations

## Database Updates:

Run the updated `supabase-setup.sql` to add:
- Google Calendar integration fields to the meetings table
- User-specific Google connection fields to the users table  
- User-specific SMTP settings fields to the users table

## Features:

✅ **Per-user Google integration** - Each user connects their own Google account
✅ **Per-user email settings** - Each user configures their own SMTP settings
✅ **Real Google Meet links** - Generated through Google Calendar API
✅ **Calendar invitations** - Automatic .ics file attachments in emails
✅ **Secure token storage** - User tokens stored in database, not environment variables