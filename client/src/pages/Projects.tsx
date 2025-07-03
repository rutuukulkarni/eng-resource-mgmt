import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  TagIcon
} from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';
import ProjectDetailsModal from '../components/ProjectDetailsModal';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  engineerCount: number;
}

const Projects = () => {
  const { token, user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? project.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading projects...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'manager' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
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
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
          
          <button className="border rounded-md px-3 py-2 flex items-center gap-1">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No projects found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedProjectId(project._id)}>
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{project.description}</p>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div>{new Date(project.startDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">End Date</div>
                      <div>{new Date(project.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Team</div>
                      <div>{project.engineerCount} / {project.teamSize}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div>
                        {Math.ceil(
                          (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24 * 7)
                        )} weeks
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">Required Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                        <TagIcon size={12} className="mr-1" />
                        {skill}
                      </span>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        +{project.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onProjectAdded={fetchProjects} 
      />

      {/* Project Details Modal */}
      {selectedProjectId && (
        <ProjectDetailsModal
          projectId={selectedProjectId}
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          onUpdate={fetchProjects}
        />
      )}
    </div>
  );
};

export default Projects;
