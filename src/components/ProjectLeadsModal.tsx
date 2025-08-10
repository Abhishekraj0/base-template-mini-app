"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";

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

interface Project {
  id: string;
  name: string;
  budget: number;
  status: string;
  client_name: string;
}

interface ProjectLeadsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectLeadsModal({ project, isOpen, onClose }: ProjectLeadsModalProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingInvites, setSendingInvites] = useState<Set<string>>(new Set());
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && project) {
      fetchFilteredLeads();
    }
  }, [isOpen, project]);

  const fetchFilteredLeads = async () => {
    setLoading(true);
    try {
      // Determine budget range based on project budget
      let budgetRange = 'low';
      if (project.budget >= 200000) budgetRange = 'enterprise';
      else if (project.budget >= 50000) budgetRange = 'high';
      else if (project.budget >= 10000) budgetRange = 'medium';

      const response = await fetch(`/api/leads/filter?budget_range=${budgetRange}`);
      const data = await response.json();
      
      // Sort leads by salary range (descending) and then by budget compatibility
      const sortedLeads = (data.leads || []).sort((a: Lead, b: Lead) => {
        // First sort by budget compatibility
        const aBudgetScore = getBudgetCompatibilityScore(a, project.budget);
        const bBudgetScore = getBudgetCompatibilityScore(b, project.budget);
        
        if (aBudgetScore !== bBudgetScore) {
          return bBudgetScore - aBudgetScore;
        }
        
        // Then by salary range (higher salary = higher priority)
        const aMaxSalary = a.salary_max || 0;
        const bMaxSalary = b.salary_max || 0;
        return bMaxSalary - aMaxSalary;
      });

      setLeads(sortedLeads.slice(0, 10)); // Limit to top 10 leads
    } catch (error) {
      console.error("Error fetching filtered leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetCompatibilityScore = (lead: Lead, projectBudget: number) => {
    const budgetRanges = {
      'low': { min: 1000, max: 10000 },
      'medium': { min: 10000, max: 50000 },
      'high': { min: 50000, max: 200000 },
      'enterprise': { min: 200000, max: Infinity }
    };

    const leadRange = budgetRanges[lead.budget_range as keyof typeof budgetRanges];
    if (!leadRange) return 0;

    // Perfect match
    if (projectBudget >= leadRange.min && projectBudget <= leadRange.max) {
      return 100;
    }

    // Close match (one range above or below)
    const difference = Math.min(
      Math.abs(projectBudget - leadRange.min),
      Math.abs(projectBudget - leadRange.max)
    );

    return Math.max(0, 100 - (difference / projectBudget) * 100);
  };

  const getBudgetRangeDisplay = (range: string) => {
    const ranges = {
      'low': '$1K - $10K',
      'medium': '$10K - $50K',
      'high': '$50K - $200K',
      'enterprise': '$200K+'
    };
    return ranges[range as keyof typeof ranges] || range;
  };

  const getCompatibilityBadge = (lead: Lead) => {
    const score = getBudgetCompatibilityScore(lead, project.budget);
    if (score >= 90) return { label: 'Perfect Match', color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { label: 'Good Match', color: 'bg-blue-100 text-blue-800' };
    if (score >= 50) return { label: 'Fair Match', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Potential', color: 'bg-gray-100 text-gray-800' };
  };

  const sendProjectInvite = async (lead: Lead) => {
    setSendingInvites(prev => new Set(prev).add(lead.id));
    
    try {
      const response = await fetch('/api/send-project-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project,
          lead,
          compatibility: getBudgetCompatibilityScore(lead, project.budget),
        }),
      });

      if (response.ok) {
        setSentInvites(prev => new Set(prev).add(lead.id));
        
        // Automatically schedule a meeting for this lead
        await scheduleFollowUpMeeting(lead, project);
        
        // Show success message briefly
        setTimeout(() => {
          setSentInvites(prev => {
            const newSet = new Set(prev);
            newSet.delete(lead.id);
            return newSet;
          });
        }, 3000);
      } else {
        alert('Failed to send invitation. Please try again.');
      }
    } catch (error) {
      console.error('Error sending project invite:', error);
      alert('Network error. Please try again.');
    } finally {
      setSendingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(lead.id);
        return newSet;
      });
    }
  };

  const scheduleFollowUpMeeting = async (lead: Lead, project: Project) => {
    try {
      // Schedule meeting for 2 days from now at 2 PM
      const meetingDate = new Date();
      meetingDate.setDate(meetingDate.getDate() + 2);
      const meetingDateStr = meetingDate.toISOString().split('T')[0];
      const meetingTime = '14:00';

      const meetingData = {
        title: `Project Discussion: ${project.name} - ${lead.name}`,
        description: `Follow-up meeting to discuss the ${project.name} project opportunity with ${lead.name} from ${lead.company || 'N/A'}. Budget: $${project.budget?.toLocaleString()}`,
        attendees: lead.email,
        meeting_date: meetingDateStr,
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
        console.log(`✅ Meeting scheduled for ${lead.name}: ${result.meeting.title}`);
        
        // Send meeting invitation email
        await fetch('/api/send-meeting-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meeting: result.meeting,
            attendeeEmail: lead.email,
            attendeeName: lead.name,
          }),
        });
        
        console.log(`📧 Meeting invite sent to ${lead.email}`);
      } else {
        console.error(`❌ Failed to schedule meeting for ${lead.name}`);
      }
    } catch (error) {
      console.error(`❌ Error scheduling meeting for ${lead.name}:`, error);
    }
  };

  const sendBulkInvites = async () => {
    const topLeads = leads.slice(0, 5); // Send to top 5 leads
    const leadsToInvite = topLeads.filter(lead => !sentInvites.has(lead.id) && !sendingInvites.has(lead.id));
    
    if (leadsToInvite.length === 0) {
      alert('All top 5 leads have already been invited!');
      return;
    }

    if (!confirm(`Send invitations to ${leadsToInvite.length} leads?`)) {
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    
    for (const lead of leadsToInvite) {
      try {
        setSendingInvites(prev => new Set(prev).add(lead.id));
        
        const response = await fetch('/api/send-project-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project,
            lead,
            compatibility: getBudgetCompatibilityScore(lead, project.budget),
          }),
        });

        if (response.ok) {
          setSentInvites(prev => new Set(prev).add(lead.id));
          
          // Schedule follow-up meeting for this lead
          await scheduleFollowUpMeeting(lead, project);
          
          successCount++;
          console.log(`✅ Bulk invite sent to ${lead.name} (${lead.email}) and meeting scheduled`);
        } else {
          errorCount++;
          console.error(`❌ Failed to send bulk invite to ${lead.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error sending bulk invite to ${lead.name}:`, error);
      } finally {
        setSendingInvites(prev => {
          const newSet = new Set(prev);
          newSet.delete(lead.id);
          return newSet;
        });
      }
      
      // Add delay between emails to avoid rate limiting
      if (leadsToInvite.indexOf(lead) < leadsToInvite.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Show final result
    if (successCount > 0 && errorCount === 0) {
      alert(`✅ Successfully sent invitations to ${successCount} leads and scheduled follow-up meetings!`);
    } else if (successCount > 0 && errorCount > 0) {
      alert(`⚠️ Sent ${successCount} invitations successfully, but ${errorCount} failed. Meetings scheduled for successful invites. Check console for details.`);
    } else if (errorCount > 0) {
      alert(`❌ Failed to send all invitations. Please try again.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Suitable Leads for {project.name}</h2>
              <p className="text-blue-100 mt-1">
                Project Budget: ${project.budget?.toLocaleString()} • Client: {project.client_name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {leads.length > 0 && (
                <button
                  onClick={sendBulkInvites}
                  disabled={Array.from(sendingInvites).length > 0}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Invite Top 5 & Schedule
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">Finding suitable leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No suitable leads found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting the project budget or add more leads to your database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Top {leads.length} Suitable Leads (Sorted by Budget Compatibility)
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Leads are ranked by budget compatibility and salary range to help you find the best matches for this project.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center text-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Auto-scheduling enabled: Follow-up meetings will be automatically scheduled 2 days from now when invitations are sent.</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Invite Statistics */}
                  {(sentInvites.size > 0 || sendingInvites.size > 0) && (
                    <div className="bg-blue-50 rounded-lg p-4 min-w-[200px]">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Invitation Status</h4>
                      <div className="space-y-1 text-sm">
                        {sendingInvites.size > 0 && (
                          <div className="flex items-center text-blue-600">
                            <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending: {sendingInvites.size}
                          </div>
                        )}
                        {sentInvites.size > 0 && (
                          <div className="flex items-center text-green-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sent: {sentInvites.size}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {leads.map((lead, index) => {
                const compatibility = getCompatibilityBadge(lead);
                return (
                  <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{lead.name}</h4>
                          <p className="text-gray-600">{lead.email}</p>
                          {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${compatibility.color}`}>
                          {compatibility.label}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">{lead.category?.replace('-', ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Budget Range:</span>
                        <p className="font-medium text-gray-900">{getBudgetRangeDisplay(lead.budget_range)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Salary Range:</span>
                        <p className="font-medium text-gray-900">
                          {lead.salary_min && lead.salary_max 
                            ? `$${lead.salary_min.toLocaleString()} - $${lead.salary_max.toLocaleString()}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Industry:</span>
                        <p className="font-medium text-gray-900">{lead.industry || 'Not specified'}</p>
                      </div>
                    </div>

                    {lead.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-gray-700 text-sm mt-1">{lead.notes}</p>
                      </div>
                    )}

                    {/* Invite Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Compatibility Score: {getBudgetCompatibilityScore(lead, project.budget).toFixed(0)}%
                      </div>
                      <div className="flex space-x-2">
                        {sentInvites.has(lead.id) ? (
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Invite Sent
                          </div>
                        ) : (
                          <button
                            onClick={() => sendProjectInvite(lead)}
                            disabled={sendingInvites.has(lead.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                          >
                            {sendingInvites.has(lead.id) ? (
                              <>
                                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Invite & Schedule
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}