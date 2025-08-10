"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Logo } from "~/components/ui/Logo";
import { Input, Select, Textarea } from "~/components/ui/input";
import { useGoogle } from "~/lib/google-context";
import { useAuth } from "~/lib/auth-context";

interface Meeting {
  id: string;
  title: string;
  description: string;
  attendees: string;
  meeting_date: string;
  meeting_time: string;
  duration: number;
  meeting_link: string;
  platform: string;
  status: string;
  created_at: string;
}

export function MeetingsScreen() {
  const { user: googleUser, accessToken, isConnected, connectGoogle, disconnectGoogle, loading: googleLoading } = useGoogle();
  const { user: authUser } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attendees: "",
    meeting_date: "",
    meeting_time: "",
    duration: "60",
    platform: "google-meet",
    status: "scheduled",
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings");
      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const generateMeetingLink = (platform: string, title: string) => {
    switch (platform) {
      case 'google-meet':
        return `https://meet.google.com/new`;
      case 'zoom':
        return `https://zoom.us/j/new`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/`;
      case 'jitsi':
        return `https://meet.jit.si/${title.replace(/\s+/g, '-').toLowerCase()}`;
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingMeeting ? `/api/meetings/${editingMeeting.id}` : "/api/meetings";
      const method = editingMeeting ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          userAccessToken: accessToken, // Pass Google access token for calendar integration
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Send email invitations for new meetings
        if (!editingMeeting && formData.attendees) {
          await sendMeetingInvitations(result.meeting);
        }

        resetForm();
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error saving meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      attendees: "",
      meeting_date: "",
      meeting_time: "",
      duration: "60",
      platform: "google-meet",
      status: "scheduled",
    });
    setShowForm(false);
    setEditingMeeting(null);
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || "",
      attendees: meeting.attendees || "",
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time,
      duration: meeting.duration?.toString() || "60",
      platform: meeting.platform,
      status: meeting.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const handleCancel = async (meetingId: string) => {
    if (!confirm("Are you sure you want to cancel this meeting?")) return;

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error cancelling meeting:", error);
    }
  };

  const sendMeetingInvitations = async (meeting: Meeting) => {
    if (!meeting.attendees) return;

    const attendeeEmails = meeting.attendees.split(',').map(email => email.trim());
    let successCount = 0;
    let errorCount = 0;
    let smtpError = false;

    for (const email of attendeeEmails) {
      try {
        setSendingEmail(email);
        const response = await fetch('/api/send-meeting-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': authUser?.id || '',
            'authorization': `Bearer token_${authUser?.id}_${Date.now()}`,
          },
          body: JSON.stringify({
            meeting,
            attendeeEmail: email,
            attendeeName: email.split('@')[0], // Simple name extraction
          }),
        });

        const result = await response.json();

        if (response.ok) {
          successCount++;
          console.log(`✅ Meeting invite sent to ${email}`);
        } else {
          errorCount++;
          if (result.needsSmtpSetup) {
            smtpError = true;
          }
          console.error(`❌ Failed to send invite to ${email}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error sending invite to ${email}:`, error);
      }
    }

    setSendingEmail(null);

    // Show user feedback
    if (smtpError) {
      alert(`⚠️ Email settings not configured. Please go to Settings to configure your email settings before sending meeting invitations.`);
    } else if (successCount > 0 && errorCount === 0) {
      alert(`✅ Meeting invitations sent successfully to ${successCount} attendee(s)!`);
    } else if (successCount > 0 && errorCount > 0) {
      alert(`⚠️ Sent ${successCount} invitations successfully, but ${errorCount} failed. Please check your email settings and try again.`);
    } else if (errorCount > 0) {
      alert(`❌ Failed to send meeting invitations. Please check your email settings and attendee email addresses.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return new Date(`${date}T${time}`).toLocaleString();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Logo size="md" className="mr-4" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Meetings Management</h2>
            <p className="text-gray-600 mt-1">Schedule and manage meetings with automatic email invitations</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !isConnected && (
            <Button
              onClick={connectGoogle}
              disabled={googleLoading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center font-medium"
            >
              {googleLoading ? (
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Connect Google
            </Button>
          )}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && isConnected && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg">
                <img
                  src={googleUser?.picture}
                  alt={googleUser?.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-green-700 font-medium">{googleUser?.email}</span>
                <button
                  onClick={disconnectGoogle}
                  className="ml-2 text-green-600 hover:text-green-800"
                  title="Disconnect Google"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <Button
            onClick={() => {
              setEditingMeeting(null);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Meeting
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && isConnected && formData.platform === 'google-meet' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-800 text-sm">
                  <strong>Google Calendar Integration:</strong> This meeting will be automatically added to your Google Calendar with a real Google Meet link and email invitations will be sent to attendees.
                </p>
              </div>
            </div>
          )}

          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && formData.platform === 'google-meet' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-yellow-800 text-sm">
                  <strong>Google Integration Not Configured:</strong> A basic Google Meet link will be generated. For real Google Calendar integration, configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input
                label="Meeting Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="col-span-2">
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the meeting purpose..."
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Attendees (comma-separated emails)"
                name="attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                placeholder="john@example.com, jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="meeting_date"
                value={formData.meeting_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="google-meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="jitsi">Jitsi Meet</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{meeting.title}</h3>
                  <p className="text-sm text-gray-500">{meeting.platform.replace('-', ' ').toUpperCase()}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {meeting.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{meeting.description}</p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateTime(meeting.meeting_date, meeting.meeting_time)}
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {meeting.duration} minutes
              </div>
              {meeting.attendees && (
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {meeting.attendees.split(',').length} attendee(s)
                </div>
              )}
            </div>

            {/* Join Meeting Button - Always show for scheduled meetings */}
            {meeting.status === 'scheduled' && (
              <div className="mb-4">
                <a
                  href={meeting.meeting_link || generateMeetingLink(meeting.platform, meeting.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
              </div>
            )}

            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleEdit(meeting)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                disabled={meeting.status === 'completed'}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              {meeting.status === 'scheduled' && (
                <button
                  onClick={() => handleCancel(meeting.id)}
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  Cancel
                </button>
              )}

              <button
                onClick={() => handleDelete(meeting.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>

            {sendingEmail && meeting.attendees?.includes(sendingEmail) && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center">
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending invitation to {sendingEmail}...
              </div>
            )}
          </div>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No meetings scheduled. Schedule your first meeting!
        </div>
      )}
    </div>
  );
}