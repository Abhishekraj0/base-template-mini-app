# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Add them to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-setup.sql`
3. Click "Run" to execute the SQL

This will create:
- A `users` table with columns: id, username, name, password, created_at, updated_at
- Proper indexes for performance
- Row Level Security policies

## 4. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new user
3. Check your Supabase dashboard > Table Editor > users to see the new user

## Security Notes

⚠️ **Important**: This demo stores passwords in plain text for simplicity. In production:

1. Hash passwords using bcrypt or similar
2. Implement proper authentication with Supabase Auth
3. Use JWT tokens for session management
4. Enable proper Row Level Security policies
5. Validate and sanitize all inputs

## Production Recommendations

For production use, consider:
- Using Supabase Auth instead of custom authentication
- Implementing email verification
- Adding password reset functionality
- Using environment-specific databases
- Setting up proper backup and monitoring