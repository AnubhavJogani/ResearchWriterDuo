import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/login",
        element: <AuthPage mode="login" />,
    },
    {
        path: "/signup",
        element: <AuthPage mode="signup" />,
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),  
        // add a 'loader' here to check 
        // Passport session status before the page even renders.
    },
]);