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
      await checkAuth(); // check token validity and set user
      setIsLoading(false); // only after it's done, allow rendering
    };

    initAuth();
  }, [checkAuth]);

  //  Wait for checkAuth() to finish before showing anything
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // After loading: conditionally render correct routes
  if (!token) {
    return (
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/engineers" element={<Engineers />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
