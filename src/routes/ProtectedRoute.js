// ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  // Giả sử bạn có một hàm để lấy quyền người dùng hiện tại
  const currentUserRole = getCurrentUserRole(); // Hàm này sẽ trả về quyền của người dùng (admin, teacher, v.v.)

  return (
    <Route
      {...rest}
      render={(props) =>
        allowedRoles.includes(currentUserRole) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/access-denied" />
        )
      }
    />
  );
};

export default ProtectedRoute;
