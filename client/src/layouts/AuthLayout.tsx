import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Engineering Resource Management
        </h1>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
