import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  Users,
  Briefcase,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalEngineers: number;
  totalProjects: number;
  activeProjects: number;
  overallocatedEngineers: number;
  underutilizedEngineers: number;
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalEngineers: 0,
    totalProjects: 0,
    activeProjects: 0,
    overallocatedEngineers: 0,
    underutilizedEngineers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard stats
        if (user?.role === 'manager') {
          // Fetch manager dashboard data
          const [engineersRes, projectsRes] = await Promise.all([
            axios.get('/api/engineers'),
            axios.get('/api/projects')
          ]);
          
          const engineers = engineersRes.data.data;
          const projects = projectsRes.data.data;
          
          const activeProjects = projects.filter(
            (project: any) => project.status === 'active'
          );
          
          // Simplified stats
          setStats({
            totalEngineers: engineers.length,
            totalProjects: projects.length,
            activeProjects: activeProjects.length,
            overallocatedEngineers: 1, // Placeholder
            underutilizedEngineers: 2  // Placeholder
          });
        } else {
          // Fetch engineer dashboard data
          const assignmentsRes = await axios.get(`/api/assignments/engineer/${user?.id}`);
          const assignments = assignmentsRes.data.data;
          
          // Simplified stats for engineers
          setStats({
            totalEngineers: 0,
            totalProjects: assignments.length,
            activeProjects: assignments.filter(
              (assignment: any) => assignment.projectId.status === 'active'
            ).length,
            overallocatedEngineers: 0,
            underutilizedEngineers: 0
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {user?.role === 'manager' ? 'Manager Dashboard' : 'My Dashboard'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">
                {user?.role === 'manager' ? 'Total Engineers' : 'My Assignments'}
              </h3>
              <p className="text-2xl font-semibold">
                {user?.role === 'manager' ? stats.totalEngineers : stats.totalProjects}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">
                {user?.role === 'manager' ? 'Total Projects' : 'Active Projects'}
              </h3>
              <p className="text-2xl font-semibold">
                {user?.role === 'manager' ? stats.totalProjects : stats.activeProjects}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">
                {user?.role === 'manager' ? 'Active Projects' : 'Current Utilization'}
              </h3>
              <p className="text-2xl font-semibold">
                {user?.role === 'manager' ? stats.activeProjects : '70%'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Card 4 - Only for managers */}
        {user?.role === 'manager' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Engineers Overallocated</h3>
                <p className="text-2xl font-semibold">{stats.overallocatedEngineers}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional dashboard content would go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {user?.role === 'manager' 
            ? 'Recent Activity' 
            : 'My Current Assignments'}
        </h2>
        <p className="text-gray-500">
          {user?.role === 'manager'
            ? 'This area would show recent assignments and changes.'
            : 'This area would show your current project assignments and capacity.'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
