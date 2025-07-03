import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

interface Engineer {
  _id: string;
  name: string;
  skills: string[];
  seniority: string;
  maxCapacity: number;
  department: string;
  availableCapacity?: number;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
}

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentAdded: () => void;
  preselectedProjectId?: string;
}

const AddAssignmentModal = ({ isOpen, onClose, onAssignmentAdded, preselectedProjectId }: AddAssignmentModalProps) => {
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  
  const [formData, setFormData] = useState({
    engineerId: '',
    projectId: preselectedProjectId || '',
    allocationPercentage: 25,
    startDate: '',
    endDate: '',
    role: 'Developer'
  });

  // Fetch engineers and projects when the modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        try {
          const [engineersRes, projectsRes] = await Promise.all([
            axios.get('/api/engineers', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get('/api/projects', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          
          setEngineers(engineersRes.data.data || []);
          setProjects(projectsRes.data.data || []);
          
          // Set default dates to current day + 1 month
          const today = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(today.getMonth() + 1);
          
          setFormData(prev => ({
            ...prev,
            projectId: preselectedProjectId || prev.projectId,
            startDate: today.toISOString().slice(0, 10),
            endDate: nextMonth.toISOString().slice(0, 10)
          }));
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load engineers or projects.');
        }
      }
    };
    
    fetchData();
  }, [isOpen, token, preselectedProjectId]);

  // Fetch engineer capacity when engineer is selected
  useEffect(() => {
    if (!formData.engineerId) return;
    
    const fetchCapacity = async () => {
      setLoadingCapacity(true);
      try {
        // Pass the selected date range as query parameters to check capacity during this period
        const response = await axios.get(`/api/engineers/${formData.engineerId}/capacity?date=${formData.startDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Capacity response:', response.data);
        
        const engineer = engineers.find(eng => eng._id === formData.engineerId);
        if (engineer) {
          setSelectedEngineer({
            ...engineer,
            availableCapacity: response.data.data.availableCapacity
          });
        }
      } catch (err) {
        console.error('Error fetching capacity:', err);
        setError('Failed to load engineer capacity.');
      } finally {
        setLoadingCapacity(false);
      }
    };
    
    fetchCapacity();
  }, [formData.engineerId, formData.startDate, formData.endDate, engineers, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Make the API request
      await axios.post('/api/assignments', 
        {
          ...formData,
          allocationPercentage: Number(formData.allocationPercentage)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Close the modal and refresh the assignments list
      onAssignmentAdded();
      onClose();
      
      // Reset form
      setFormData({
        engineerId: '',
        projectId: '',
        allocationPercentage: 25,
        startDate: '',
        endDate: '',
        role: 'Developer'
      });
      setSelectedEngineer(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter projects to only show those that match the engineer's skills
  const filteredProjects = projects.filter(project => {
    if (!formData.engineerId) return true;
    
    const engineer = engineers.find(eng => eng._id === formData.engineerId);
    if (!engineer) return true;
    
    return project.requiredSkills.some(skill => 
      engineer.skills.includes(skill)
    );
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Assignment
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm flex items-start">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="engineerId" className="block text-sm font-medium text-gray-700">
                      Engineer*
                    </label>
                    <select
                      id="engineerId"
                      name="engineerId"
                      required
                      value={formData.engineerId}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select an engineer</option>
                      {engineers.map(engineer => (
                        <option key={engineer._id} value={engineer._id}>
                          {engineer.name} - {engineer.seniority} {engineer.department} ({engineer.skills.join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEngineer && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Engineer Capacity</h4>
                      {loadingCapacity ? (
                        <div className="text-sm text-gray-500">Loading capacity...</div>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Available:</span>
                            <span className="font-medium">{selectedEngineer.availableCapacity}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                selectedEngineer.availableCapacity! > 50 ? 'bg-green-600' : 
                                selectedEngineer.availableCapacity! > 20 ? 'bg-yellow-500' : 'bg-red-600'
                              }`} 
                              style={{ width: `${selectedEngineer.availableCapacity}%` }}
                            ></div>
                          </div>
                          
                          {selectedEngineer.availableCapacity! < formData.allocationPercentage && (
                            <div className="text-xs text-red-600 mt-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              Engineer doesn't have enough capacity for this allocation
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                      Project*
                    </label>
                    <select
                      id="projectId"
                      name="projectId"
                      required
                      value={formData.projectId}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a project</option>
                      {filteredProjects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.name} ({project.status})
                        </option>
                      ))}
                    </select>
                    
                    {formData.engineerId && filteredProjects.length === 0 && (
                      <div className="text-xs text-amber-600 mt-1 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        No projects match this engineer's skills
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role on Project*
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      required
                      placeholder="e.g., Developer, Tech Lead, QA"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="allocationPercentage" className="block text-sm font-medium text-gray-700">
                      Allocation Percentage* ({formData.allocationPercentage}%)
                    </label>
                    <input
                      type="range"
                      id="allocationPercentage"
                      name="allocationPercentage"
                      min="5"
                      max="100"
                      step="5"
                      required
                      value={formData.allocationPercentage}
                      onChange={handleChange}
                      className="mt-1 block w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((formData.allocationPercentage / 100) * 40)} hours per week (based on 40h work week)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date*
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date*
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        required
                        value={formData.endDate}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || (selectedEngineer?.availableCapacity! < formData.allocationPercentage)}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddAssignmentModal;
