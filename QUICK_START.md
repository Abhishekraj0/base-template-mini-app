# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Set Up Database
Run the SQL commands in `supabase-setup.sql` in your Supabase database.

### 3. Start the App
```bash
npm run dev
```

That's it! The app will work with basic functionality.

## 🎯 Core Features (Work Immediately)

✅ **User Authentication** - Sign up and sign in
✅ **Leads Management** - Add, edit, and track leads
✅ **Project Management** - Manage projects and budgets
✅ **Meeting Scheduling** - Create meetings with basic links
✅ **Settings** - Configure user preferences

## 🔧 Optional Enhancements

### Email Integration (For Meeting Invitations)
Add to your `.env.local`:
```env
# For system-wide emails (welcome emails)
SYSTEM_SMTP_EMAIL=your_email@gmail.com
SYSTEM_SMTP_PASSWORD=your_app_password
```

Users can also configure their own SMTP settings in Settings → Email Settings.

### Google Calendar Integration
Add to your `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Get this from [Google Cloud Console](https://console.cloud.google.com/).

## 🎉 What Works Without Configuration

- ✅ Complete user authentication system
- ✅ Full CRUD operations for leads and projects
- ✅ Meeting scheduling with generated links
- ✅ User settings and preferences
- ✅ Responsive design with dark/light themes

## 📧 Email Features

- **Without SMTP**: Emails are logged to console (development mode)
- **With User SMTP**: Users can send meeting invitations from their own email
- **With System SMTP**: Welcome emails are sent automatically

## 🔗 Google Integration

- **Without Google Client ID**: Basic meeting links are generated
- **With Google Client ID**: Users can connect their Google accounts for real Calendar integration

## 🛠️ Troubleshooting

### "Module not found: Can't resolve 'nodemailer'"
```bash
npm install nodemailer @types/nodemailer
```

### "Google Client ID not configured"
This is just a warning. The app works without Google integration.

### Database errors
Make sure you've run the SQL commands from `supabase-setup.sql`.

## 📚 Next Steps

1. **Try the app** - Sign up and explore the features
2. **Configure email** - Set up SMTP for meeting invitations
3. **Add Google integration** - Connect Google Calendar for enhanced meetings
4. **Customize** - Modify the code to fit your needs

The app is designed to work great out of the box and get better with each optional enhancement you add!