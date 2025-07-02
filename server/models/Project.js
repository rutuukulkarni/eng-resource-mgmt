import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import {
  Plus, Search, Filter, Calendar, Users, Clock, TagIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Projects = () => {
  const { token, user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    requiredSkills: '',
    teamSize: '',
    status: 'planning',
  });

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(skill => skill.trim()),
      };

      await axios.post('/api/projects', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Project created successfully!');
      setShowModal(false);
      setForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        requiredSkills: '',
        teamSize: '',
        status: 'planning',
      });
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error creating project');
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? project.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role === 'manager' && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      {/* Search & Filter */}
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
          </select>

          <button className="border rounded-md px-3 py-2 flex items-center gap-1">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {/* Project Cards */}
      {isLoading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project._id} className="border rounded-md shadow hover:shadow-lg transition">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Project</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Project Name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <textarea placeholder="Description" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              <input type="text" placeholder="Required Skills (comma separated)" className="input" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} required />
              <input type="number" placeholder="Team Size" className="input" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} required />
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
