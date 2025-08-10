"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Logo } from "~/components/ui/Logo";
import { Input, Select, Textarea } from "~/components/ui/input";
import { ProjectLeadsModal } from "~/components/ProjectLeadsModal";

interface Project {
  id: string;
  name: string;
  description: string;
  client_name: string;
  budget: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client_name: "",
    budget: "",
    status: "planning",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
        }),
      });

      if (response.ok) {
        resetForm();
        fetchProjects();
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      client_name: "",
      budget: "",
      status: "planning",
      start_date: "",
      end_date: "",
    });
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      client_name: project.client_name,
      budget: project.budget?.toString() || "",
      status: project.status,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleViewLeads = (project: Project) => {
    setSelectedProject(project);
    setShowLeadsModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Logo size="md" className="mr-4" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Projects Management</h2>
            <p className="text-gray-600 mt-1">Track and manage your projects with detailed insights</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => {
              setEditingProject(null);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Project
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingProject ? "Edit Project" : "Add New Project"}
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
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <Input
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
            />
            
            <Input
              label="Client Name"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              placeholder="Enter client name"
              required
            />
            
            <div className="col-span-2">
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the project..."
                rows={3}
              />
            </div>
            
            <Input
              label="Budget ($)"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "on-hold", label: "On Hold" },
                { value: "completed", label: "Completed" }
              ]}
            />
            
            <Input
              label="Start Date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
            
            <Input
              label="End Date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
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
                {loading ? "Adding..." : "Add Project"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <div 
              onClick={() => handleViewLeads(project)}
              className="mb-4"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.client_name}</p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-semibold text-green-600">${project.budget?.toLocaleString()}</span>
                </div>
                {project.start_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start:</span>
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">End:</span>
                    <span>{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4 group-hover:bg-blue-100 transition-colors">
                <div className="flex items-center text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">Click to view suitable leads</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(project);
                }}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No projects found. Add your first project!
        </div>
      )}

      {/* Project Leads Modal */}
      {selectedProject && (
        <ProjectLeadsModal
          project={selectedProject}
          isOpen={showLeadsModal}
          onClose={() => {
            setShowLeadsModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}