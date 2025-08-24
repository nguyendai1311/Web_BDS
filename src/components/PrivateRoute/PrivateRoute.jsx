import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles, user }) => {
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
