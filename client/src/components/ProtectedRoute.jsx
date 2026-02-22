import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user') || localStorage.getItem('isGuest') === 'true' ? true : false;
  if ( !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;