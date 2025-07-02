import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      showFor: ['manager', 'engineer']
    },
    {
      path: '/engineers',
      name: 'Engineers',
      icon: <Users className="h-5 w-5" />,
      showFor: ['manager']
    },
    {
      path: '/projects',
      name: 'Projects',
      icon: <Briefcase className="h-5 w-5" />,
      showFor: ['manager', 'engineer']
    },
    {
      path: '/assignments',
      name: 'Assignments',
      icon: <Calendar className="h-5 w-5" />,
      showFor: ['manager', 'engineer']
    },
    {
      path: '/profile',
      name: 'Profile',
      icon: <UserCircle className="h-5 w-5" />,
      showFor: ['manager', 'engineer']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.showFor.includes(user?.role || 'engineer')
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`w-full md:w-64 bg-white shadow-md flex-shrink-0 ${
          isMobileMenuOpen ? 'fixed inset-0 z-40' : 'hidden md:block'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="mb-8 py-4">
            <h1 className="text-xl font-bold text-center">
              Resource Management
            </h1>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {filteredNavItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto">
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {user?.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
