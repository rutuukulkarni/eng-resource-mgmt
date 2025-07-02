import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  Plus,
  Search,
  Filter,
  User,
  Code,
  Briefcase,
  Calendar
} from 'lucide-react';

interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
  title?: string;
  createdAt?: string;
}

const Engineers = () => {
  const { token } = useAuthStore();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeniority, setFilterSeniority] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');

  useEffect(() => {
    const fetchEngineers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/engineers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEngineers(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching engineers:', err);
        setError('Failed to load engineers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineers();
  }, [token]);

  const filteredEngineers = engineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeniority = filterSeniority ? engineer.seniority === filterSeniority : true;
    const matchesDepartment = filterDepartment ? engineer.department === filterDepartment : true;
    
    return matchesSearch && matchesSeniority && matchesDepartment;
  });

  const getAvailabilityClass = (maxCapacity: number) => {
    if (maxCapacity >= 80) return 'bg-green-100 text-green-800';
    if (maxCapacity >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading engineers...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Engineers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <Plus size={16} />
          Add Engineer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or skills..."
            className="pl-10 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={filterSeniority}
            onChange={(e) => setFilterSeniority(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
          
          <select 
            className="border rounded-md px-3 py-2"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Fullstack">Fullstack</option>
            <option value="Mobile">Mobile</option>
          </select>
          
          <button className="border rounded-md px-3 py-2 flex items-center gap-1">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {filteredEngineers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No engineers found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEngineers.map(engineer => (
                <tr key={engineer._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="text-gray-500" size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{engineer.name}</div>
                        <div className="text-sm text-gray-500">{engineer.email}</div>
                        <div className="text-xs text-gray-500">{engineer.title || `${engineer.seniority} ${engineer.department} Engineer`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {engineer.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                          <Code size={12} className="mr-1" />
                          {skill}
                        </span>
                      ))}
                      {engineer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{engineer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 capitalize">
                      {engineer.seniority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Briefcase size={16} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-900 capitalize">{engineer.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityClass(engineer.maxCapacity)}`}>
                      {engineer.maxCapacity}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1" />
                      {engineer.createdAt ? new Date(engineer.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Engineers;
