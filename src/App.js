import React, { Fragment, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";
import { isJsonString } from "./utils";
import {jwtDecode} from "jwt-decode";
import * as UserService from "./services/UserService";
import { useDispatch, useSelector } from "react-redux";
import { resetUser, updateUser } from "./redux/slices/userSlice";
import Loading from "./components/LoadingComponent/LoadingComponent";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AccessDeniedPage from "./pages/User/AccessDeniedPage/AccessDeniedPage";
import SignInPage from "./pages/User/SignInPages/SignInPages";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy chi tiết user khi load app
  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      try {
        const { decoded, storageData } = handleDecoded();
        if (decoded?.id) {
          await handleGetDetailsUser(decoded.id, storageData);
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    initUser();
  }, []);

  const handleDecoded = () => {
    let storageData = user?.access_token || localStorage.getItem("access_token");
    let decoded = {};
    if (storageData && isJsonString(storageData) && !user?.access_token) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  const handleGetDetailsUser = async (id, token) => {
    try {
      const res = await UserService.getDetailsUser(id, token);
      const storageRefreshToken = localStorage.getItem("refresh_token");
      const refreshToken = storageRefreshToken ? JSON.parse(storageRefreshToken) : null;

      const userData = res?.data;
      let role = "employee";
      if (userData.roles && userData.roles.includes("admin")) role = "admin";

      const userObj = {
        ...userData,
        role,
        access_token: token,
        refresh_token: refreshToken,
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      dispatch(updateUser(userObj));
    } catch (err) {
      console.error("Lỗi lấy chi tiết user:", err);
      dispatch(resetUser());
    }
  };

  // Interceptor axiosJWT
  useEffect(() => {
    const interceptor = UserService.axiosJWT.interceptors.request.use(
      async (config) => {
        const currentTime = Date.now() / 1000;
        const { decoded } = handleDecoded();
        const storageRefreshToken = localStorage.getItem("refresh_token");
        const refreshToken = storageRefreshToken ? JSON.parse(storageRefreshToken) : null;

        if (decoded?.exp < currentTime && refreshToken) {
          const decodedRefresh = jwtDecode(refreshToken);
          if (decodedRefresh?.exp > currentTime) {
            const data = await UserService.refreshToken(refreshToken);
            config.headers["token"] = `Bearer ${data?.access_token}`;
          } else {
            dispatch(resetUser());
          }
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    return () => {
      UserService.axiosJWT.interceptors.request.eject(interceptor);
    };
  }, [dispatch, user?.access_token]);

  // Component redirect theo role
  const RoleRedirect = () => {
  if (!user?.access_token) return <Navigate to="/sign-in" replace />;
  if (user.roles && user.roles.includes("admin")) return <Navigate to="/system/admin" replace />;
  return <Navigate to="/sign-in" replace />; // employee hoặc user bình thường
};


  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Loading isLoading={isLoading}>
        <Router>
          <Routes>
            {/* Route gốc: redirect theo role */}
            <Route path="/" element={<RoleRedirect />} />

            <Route path="/sign-in" element={<SignInPage />} />

            {routes.map((route) => {
              if (route.children) {
                const Layout = route.layout;
                if (route.isPrivated) {
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <PrivateRoute
                          allowedRoles={route.allowedRoles}
                          userRole={user?.role}
                          user={user?.user}
                        />
                      }
                    >
                      <Route element={<Layout />}>
                        {route.children.map((child) => (
                          <Route
                            key={child.path}
                            path={child.path}
                            element={<child.page />}
                          />
                        ))}
                      </Route>
                    </Route>
                  );
                }

                return (
                  <Route path={route.path} element={<Layout />} key={route.path}>
                    {route.children.map((child) => (
                      <Route
                        key={child.path}
                        path={child.path}
                        element={<child.page />}
                      />
                    ))}
                  </Route>
                );
              }

              const Page = route.page;
              const Layout = route.isShowHeader ? Fragment : Fragment;

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}

            <Route path="/access-denied" element={<AccessDeniedPage />} />
          </Routes>
        </Router>
      </Loading>
    </div>
  );
}

export default App;