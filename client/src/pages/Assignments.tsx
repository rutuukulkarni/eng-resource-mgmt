import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  Briefcase
} from 'lucide-react';
import AddAssignmentModal from '../components/AddAssignmentModal';

interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
    email: string;
    title?: string;
    department?: string;
    seniority?: string;
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
  status?: 'active' | 'completed' | 'planned';
}

const Assignments = () => {
  const { token, user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterProject, _setFilterProject] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      let url = '/api/assignments';
      
      // If user is an engineer, only fetch their assignments
      if (user?.role === 'engineer') {
        url = `/api/assignments/engineer/${user.id}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAssignments(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token, user]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.engineerId.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      assignment.projectId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? assignment.status === filterStatus : true;
    const matchesProject = filterProject ? assignment.projectId._id === filterProject : true;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading assignments...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resource Assignments</h1>
        {user?.role === 'manager' && (
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={16} />
            Create Assignment
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by engineer or project..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
          </select>
          
          <button className="border rounded-md px-3 py-2 flex items-center gap-1">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No assignments found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map(assignment => (
                <tr key={assignment._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="text-gray-500" size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.engineerId.name}</div>
                        <div className="text-xs text-gray-500">{assignment.engineerId.title || assignment.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Briefcase className="text-blue-600" size={16} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{assignment.projectId.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{assignment.projectId.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(assignment.status || 'active')}`}>
                      {assignment.status ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {assignment.hoursPerWeek ? 
                          `${assignment.hoursPerWeek} hours` : 
                          `${Math.round((assignment.allocationPercentage / 100) * 40)} hours (${assignment.allocationPercentage}%)`}
                      </span>
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
                    <div className="text-xs text-gray-500 mt-1">
                      {assignment.allocationPercentage < 30 ? 'Low' : 
                       assignment.allocationPercentage < 70 ? 'Moderate' : 
                       'High'} allocation
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(assignment.startDate).toLocaleDateString()} 
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {new Date(assignment.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.ceil(
                          (new Date(assignment.endDate).getTime() - new Date(assignment.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Assignment Modal */}
      {isAddModalOpen && (
        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAssignmentAdded={fetchAssignments}
        />
      )}
    </div>
  );
};

export default Assignments;
