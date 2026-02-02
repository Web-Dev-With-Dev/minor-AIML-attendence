import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = user.role === 'admin'
            ? '/admin'
            : user.role === 'student'
                ? '/student'
                : '/';
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
