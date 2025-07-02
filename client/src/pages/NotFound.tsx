import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page Not Found</p>
      <p className="text-gray-600 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
