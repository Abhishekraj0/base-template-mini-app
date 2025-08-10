# 🚀 Setup Instructions for Ansluta App

## ❌ Current Issue: Database Tables Not Created

The error "Failed to create user" occurs because the database tables haven't been created yet.

## ✅ Solution: Run the Database Schema

### Step 1: Go to Supabase SQL Editor
1. Open your browser and go to: https://supabase.com/dashboard/project/nfpodetepyhzwkzfeqtc/sql
2. Click on "New Query" or use the SQL Editor

### Step 2: Copy and Paste the Schema
Copy the entire content from `supabase-setup.sql` and paste it into the SQL Editor, then click "Run".

Or copy this SQL directly:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  client_name VARCHAR(100) NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  attendees TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  meeting_link TEXT,
  platform VARCHAR(50) DEFAULT 'google-meet' CHECK (platform IN ('google-meet', 'zoom', 'teams', 'jitsi')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo only)
CREATE POLICY "Public access to users" ON users FOR ALL USING (true);
CREATE POLICY "Public access to leads" ON leads FOR ALL USING (true);
CREATE POLICY "Public access to projects" ON projects FOR ALL USING (true);
CREATE POLICY "Public access to meetings" ON meetings FOR ALL USING (true);
```

### Step 3: Test the Connection
After running the SQL, test the database connection:

```bash
npm run dev
```

Then visit: http://localhost:3000/api/test-db

You should see: `{"success":true,"message":"Database connection successful!"}`

### Step 4: Test the App
1. Go to http://localhost:3000
2. Try signing up with a new user
3. The signup should now work successfully!

### Step 5: Seed Indian Data (Optional)
To populate your database with 100 Indian leads and 30 Indian projects:

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. In a new terminal, run the seed script:
   ```bash
   node seed-indian-data.js
   ```

This will add realistic Indian data including:
- **100 Leads**: With Indian names, companies (TCS, Infosys, Wipro, etc.), cities, and realistic salary ranges
- **30 Projects**: Various project types with Indian companies and appropriate budgets
- **Realistic Data**: Proper categorization, budget ranges, and status distributions

## 🎯 What This Creates
- **users** table for authentication
- **leads** table for lead management
- **projects** table for project tracking  
- **meetings** table for meeting scheduling
- Proper indexes for performance
- Row Level Security policies

## 🔧 Troubleshooting
If you still get errors:
1. Check that all tables were created in Supabase Table Editor
2. Verify your `.env.local` file has the correct Supabase URL and key
3. Make sure the Supabase project is active and not paused