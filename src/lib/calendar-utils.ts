// Calendar utilities for creating .ics files and managing calendar events

export function createCalendarInvite(meeting: any): string {
  const startDate = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
  const endDate = new Date(startDate.getTime() + (meeting.duration * 60000));
  
  // Format dates for ICS format (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDateICS = formatICSDate(startDate);
  const endDateICS = formatICSDate(endDate);
  const nowICS = formatICSDate(new Date());
  
  // Generate unique UID
  const uid = `meeting-${meeting.id || Date.now()}@ansluta.com`;

  // Create attendees list
  const attendeesList = meeting.attendees 
    ? meeting.attendees.split(',').map((email: string) => 
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${email.trim()}`
      ).join('\r\n')
    : '';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ansluta//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowICS}`,
    `DTSTART:${startDateICS}`,
    `DTEND:${endDateICS}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${meeting.description || ''}${meeting.meeting_link ? `\\n\\nJoin Meeting: ${meeting.meeting_link}` : ''}`,
    `LOCATION:${meeting.meeting_link || 'Online Meeting'}`,
    `ORGANIZER:mailto:${process.env.SMTP_EMAIL || 'noreply@ansluta.com'}`,
    attendeesList,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Meeting reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');

  return icsContent;
}

export function generateGoogleMeetLink(): string {
  // Generate a random meeting ID for Google Meet
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomString = Array.from({ length: 10 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  
  return `https://meet.google.com/${randomString.slice(0, 3)}-${randomString.slice(3, 7)}-${randomString.slice(7)}`;
}

export function generateZoomLink(): string {
  // Generate a random Zoom meeting ID
  const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `https://zoom.us/j/${meetingId}`;
}

export function generateTeamsLink(): string {
  // Generate a random Teams meeting ID
  const randomId = Math.random().toString(36).substring(2, 15);
  return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${randomId}%40thread.v2/0`;
}

export function generateJitsiLink(title: string): string {
  const roomName = title.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
  return `https://meet.jit.si/${roomName}`;
}