import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { 
  X, 
  Calendar, 
  Users, 
  Clock, 
  TagIcon, 
  Plus,
  User,
  AlertCircle,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import AddAssignmentModal from './AddAssignmentModal';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  managerId: string;
}

interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
    skills: string[];
    seniority: string;
    department?: string;
    title?: string;
  };
  projectId: {
    _id: string;
    name: string;
    status: string;
  };
  allocationPercentage: number;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
  role: string;
}

interface ProjectDetailsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ProjectDetailsModal = ({ projectId, isOpen, onClose, onUpdate }: ProjectDetailsModalProps) => {
  const { token, user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      // Fetch project details
      const projectRes = await axios.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProject(projectRes.data.data);
      
      // Fetch project assignments
      const assignmentsRes = await axios.get(`/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId }
      });
      
      // Filter to only get assignments for this project
      const projectAssignments = assignmentsRes.data.data.filter(
        (assignment: any) => assignment.projectId._id === projectId
      );
      
      setAssignments(projectAssignments);
      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectData();
    }
  }, [isOpen, projectId, token]);

  const handleDeleteAssignment = async (assignmentId: string) => {
    setIsDeleting(true);
    setSelectedAssignmentId(assignmentId);
    setDeleteError(null);
    
    try {
      await axios.delete(`/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove deleted assignment from state
      setAssignments(assignments.filter(a => a._id !== assignmentId));
      setSelectedAssignmentId(null);
      
      // Trigger update in parent component
      onUpdate();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setDeleteError('Failed to remove assignment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">{project?.name || 'Project Details'}</h2>
            <span className={`ml-2 px-2 py-1 text-xs rounded-full capitalize ${
              project?.status === 'active' ? 'bg-green-100 text-green-800' : 
              project?.status === 'planning' ? 'bg-blue-100 text-blue-800' : 
              project?.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project?.status || 'Unknown'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">Loading project details...</div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-800 m-4 rounded-md">{error}</div>
        ) : (
          <div className="p-4">
            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Project Information</h3>
                <p className="text-gray-700 mb-4">{project?.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div>{project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">End Date</div>
                      <div>{project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Team Size</div>
                      <div>{assignments.length} / {project?.teamSize || 0} engineers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div>
                        {project?.startDate && project?.endDate ? Math.ceil(
                          (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24 * 7)
                        ) : 'N/A'} weeks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project?.requiredSkills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                      <TagIcon size={14} className="mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* Team Status */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Team Status</h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Team Capacity:</span>
                      <span>{assignments.length} / {project?.teamSize} engineers</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          assignments.length >= project?.teamSize! ? 'bg-green-600' : 
                          assignments.length > project?.teamSize! / 2 ? 'bg-yellow-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${Math.min(100, (assignments.length / (project?.teamSize || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assignments Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Project Assignments</h3>
                {user?.role === 'manager' && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Add Engineer
                  </button>
                )}
              </div>
              
              {assignments.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-md text-center">
                  <div className="flex justify-center mb-2">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No engineers assigned to this project yet.</p>
                  {user?.role === 'manager' && (
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      + Assign Engineers
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        {user?.role === 'manager' && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map(assignment => (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="text-gray-500" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{assignment.engineerId.name}</div>
                                <div className="text-xs text-gray-500">{assignment.engineerId.title || `${assignment.engineerId.seniority} ${assignment.engineerId.department} Engineer`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm">{assignment.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <span className="font-medium">{assignment.allocationPercentage}%</span>
                              <span className="text-gray-500 ml-1">({assignment.hoursPerWeek} hrs/week)</span>
                            </div>
                            
                            {/* Capacity visualization */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  assignment.allocationPercentage < 30 ? 'bg-blue-500' : 
                                  assignment.allocationPercentage < 70 ? 'bg-green-500' : 
                                  'bg-yellow-500'
                                }`} 
                                style={{ width: `${assignment.allocationPercentage}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="flex items-center">
                                <Calendar size={14} className="mr-1 text-gray-500" />
                                {new Date(assignment.startDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center mt-1">
                                <Calendar size={14} className="mr-1 text-gray-500" />
                                {new Date(assignment.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          {user?.role === 'manager' && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button 
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                disabled={isDeleting && selectedAssignmentId === assignment._id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDeleting && selectedAssignmentId === assignment._id ? (
                                  'Removing...'
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {deleteError && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Assignment Modal */}
      {isAddModalOpen && (
        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAssignmentAdded={() => {
            fetchProjectData();
            onUpdate();
          }}
          preselectedProjectId={projectId}
        />
      )}
    </div>
  );
};

export default ProjectDetailsModal;
