import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Engineers from './pages/Engineers';
import Projects from './pages/Projects';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { useAuthStore } from './stores/authStore';

function App() {
  const { token, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    initAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {!token ? (
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      ) : (
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
