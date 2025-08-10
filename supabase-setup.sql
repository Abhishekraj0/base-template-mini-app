-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, this should be hashed
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(100),
  designation VARCHAR(100),
  location VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  theme VARCHAR(20) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  -- Google Integration fields
  google_connected BOOLEAN DEFAULT false,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_email VARCHAR(255),
  google_name VARCHAR(100),
  google_picture TEXT,
  google_connected_at TIMESTAMP WITH TIME ZONE,
  -- SMTP Email Settings
  smtp_email VARCHAR(255),
  smtp_password TEXT,
  smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER DEFAULT 587,
  smtp_secure BOOLEAN DEFAULT true,
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
  category VARCHAR(50) DEFAULT 'individual' CHECK (category IN ('individual', 'startup', 'small-business', 'enterprise', 'government')),
  salary_min DECIMAL(12,2) DEFAULT 0,
  salary_max DECIMAL(12,2) DEFAULT 0,
  budget_range VARCHAR(50) DEFAULT 'low' CHECK (budget_range IN ('low', 'medium', 'high', 'enterprise')),
  industry VARCHAR(100),
  location VARCHAR(100),
  notes TEXT,
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
  attendees TEXT, -- Comma-separated emails
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration INTEGER DEFAULT 60, -- Duration in minutes
  meeting_link TEXT,
  platform VARCHAR(50) DEFAULT 'google-meet' CHECK (platform IN ('google-meet', 'zoom', 'teams', 'jitsi')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  google_event_id VARCHAR(255), -- Google Calendar event ID
  google_calendar_link TEXT, -- Link to Google Calendar event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_budget_range ON leads(budget_range);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Enable Row Level Security (RLS) - For demo, we'll allow public access
-- In production, implement proper user-based policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo only)
-- Users table policies
CREATE POLICY "Public access to users" ON users FOR ALL USING (true);

-- Leads table policies
CREATE POLICY "Public access to leads" ON leads FOR ALL USING (true);

-- Projects table policies
CREATE POLICY "Public access to projects" ON projects FOR ALL USING (true);

-- Meetings table policies
CREATE POLICY "Public access to meetings" ON meetings FOR ALL USING (true);

-- Note: For this demo, we're allowing public access to all tables
-- In production, you should implement proper authentication and authorization
-- with user-specific policies based on auth.uid()