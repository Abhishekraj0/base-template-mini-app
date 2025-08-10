"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Input, Select, Textarea } from "~/components/ui/input";
import { Logo } from "~/components/ui/Logo";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  category: string;
  salary_min: number;
  salary_max: number;
  budget_range: string;
  industry: string;
  location: string;
  notes: string;
  status: string;
  created_at: string;
}

export function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    category: "individual",
    salary_min: "",
    salary_max: "",
    budget_range: "low",
    industry: "",
    location: "",
    notes: "",
    status: "new",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : "/api/leads";
      const method = editingLead ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        fetchLeads();
      }
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      category: "individual",
      salary_min: "",
      salary_max: "",
      budget_range: "low",
      industry: "",
      location: "",
      notes: "",
      status: "new",
    });
    setShowForm(false);
    setEditingLead(null);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      category: lead.category || "individual",
      salary_min: lead.salary_min?.toString() || "",
      salary_max: lead.salary_max?.toString() || "",
      budget_range: lead.budget_range || "low",
      industry: lead.industry || "",
      location: lead.location || "",
      notes: lead.notes || "",
      status: lead.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const scheduleMeeting = async (lead: Lead) => {
    try {
      // Auto-schedule a meeting for tomorrow at 2 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const meetingDate = tomorrow.toISOString().split('T')[0];
      const meetingTime = '14:00';

      const meetingData = {
        title: `Initial Consultation - ${lead.name}`,
        description: `Initial consultation meeting with ${lead.name} from ${lead.company || 'N/A'}. Budget range: ${lead.budget_range}`,
        attendees: lead.email,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        duration: 60,
        platform: 'google-meet',
        status: 'scheduled',
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const result = await response.json();
        // Send email invitation
        await sendMeetingInvite(lead, result.meeting);
        alert(`Meeting scheduled successfully for ${lead.name}!`);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const sendMeetingInvite = async (lead: Lead, meeting: any) => {
    try {
      // This would integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll just log the invite details
      console.log('Sending meeting invite to:', lead.email);
      console.log('Meeting details:', meeting);

      // In a real implementation, you would call an email API here
      // Example with a hypothetical email service:
      /*
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.email,
          subject: `Meeting Invitation - ${meeting.title}`,
          html: `
            <h2>Meeting Invitation</h2>
            <p>Hi ${lead.name},</p>
            <p>You have been invited to a meeting:</p>
            <ul>
              <li><strong>Title:</strong> ${meeting.title}</li>
              <li><strong>Date:</strong> ${meeting.meeting_date}</li>
              <li><strong>Time:</strong> ${meeting.meeting_time}</li>
              <li><strong>Duration:</strong> ${meeting.duration} minutes</li>
              <li><strong>Platform:</strong> ${meeting.platform}</li>
            </ul>
            <p><a href="${meeting.meeting_link}">Join Meeting</a></p>
          `
        })
      });
      */
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Logo size="md" className="mr-4" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Leads Management</h2>
            <p className="text-gray-600 mt-1">Manage your leads with advanced categorization and budget tracking</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Lead
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Add New Lead</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />

                <Input
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Category & Budget Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Category & Budget
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="individual">Individual</option>
                    <option value="startup">Startup</option>
                    <option value="small-business">Small Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low ($1K - $10K)</option>
                    <option value="medium">Medium ($10K - $50K)</option>
                    <option value="high">High ($50K - $200K)</option>
                    <option value="enterprise">Enterprise ($200K+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range Min ($)
                  </label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Minimum salary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range Max ($)
                  </label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Maximum salary"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="City, State/Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Additional notes about this lead..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Lead...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Lead
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lead Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category & Budget
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Salary Range
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        {lead.company && (
                          <div className="text-xs text-gray-400">{lead.company}</div>
                        )}
                        {lead.location && (
                          <div className="text-xs text-gray-400">📍 {lead.location}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${lead.category === 'individual' ? 'bg-purple-100 text-purple-800' :
                        lead.category === 'startup' ? 'bg-green-100 text-green-800' :
                          lead.category === 'small-business' ? 'bg-blue-100 text-blue-800' :
                            lead.category === 'enterprise' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {lead.category?.replace('-', ' ') || 'N/A'}
                      </span>
                      <div className={`text-xs font-medium ${lead.budget_range === 'low' ? 'text-green-600' :
                        lead.budget_range === 'medium' ? 'text-yellow-600' :
                          lead.budget_range === 'high' ? 'text-orange-600' :
                            'text-red-600'
                        }`}>
                        {lead.budget_range === 'low' ? '$1K - $10K' :
                          lead.budget_range === 'medium' ? '$10K - $50K' :
                            lead.budget_range === 'high' ? '$50K - $200K' :
                              '$200K+'}
                      </div>
                      {lead.industry && (
                        <div className="text-xs text-gray-500">{lead.industry}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lead.salary_min && lead.salary_max ? (
                        <div>
                          <div className="font-medium">${lead.salary_min?.toLocaleString()} - ${lead.salary_max?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Annual</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => scheduleMeeting(lead)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leads.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first lead.</p>
          </div>
        )}
      </div>
    </div>
  );
}