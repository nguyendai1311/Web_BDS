import React, { Fragment, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";
import { isJsonString } from "./utils";
import { jwtDecode } from "jwt-decode";
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

  // =================== Helper check token ===================
// =================== Helper check token ===================
const handleDecoded = () => {
  let storageData = user?.access_token || localStorage.getItem("access_token");
  let decoded = {};
  
  if (storageData && isJsonString(storageData)) {
    // Nếu là JSON string thì parse
    storageData = JSON.parse(storageData);
  }
  
  if (storageData) {
    try {
      decoded = jwtDecode(storageData);
    } catch (error) {
      console.error("Error decoding token:", error);
      return { decoded: {}, storageData: null };
    }
  }
  
  return { decoded, storageData };
};

const refreshAccessTokenIfNeeded = async () => {
  const { decoded, storageData } = handleDecoded();
  const currentTime = Date.now() / 1000;
  let token = storageData;

  console.log("Checking access token:", decoded);
  
  // Chỉ refresh khi token thực sự hết hạn (thêm buffer 5 phút)
  if (decoded?.exp && decoded.exp < currentTime + 300) {
    const refreshToken = localStorage.getItem("refresh_token");
    let parsedRefreshToken = refreshToken;
    
    if (refreshToken && isJsonString(refreshToken)) {
      parsedRefreshToken = JSON.parse(refreshToken);
    }

    if (parsedRefreshToken) {
      try {
        const decodedRefresh = jwtDecode(parsedRefreshToken);
        if (decodedRefresh.exp > currentTime) {
          // Refresh access token
          const data = await UserService.refreshToken(parsedRefreshToken);
          token = data?.access_token;

          // Update Redux state + localStorage (không JSON.stringify 2 lần)
          localStorage.setItem("access_token", token);
          const updatedUser = { ...user, access_token: token };
          dispatch(updateUser(updatedUser));
        } else {
          // Refresh token hết hạn
          dispatch(resetUser());
          localStorage.clear();
          return null;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        dispatch(resetUser());
        localStorage.clear();
        return null;
      }
    } else {
      dispatch(resetUser());
      localStorage.clear();
      return null;
    }
  }

  return token;
};

// =================== Axios interceptor - chỉ thêm token, không tự động refresh ===================
useEffect(() => {
  const interceptor = UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      // Chỉ lấy token hiện tại, không tự động refresh
      const { storageData } = handleDecoded();
      
      if (storageData) {
        config.headers["token"] = `Bearer ${storageData}`;
      }
      
      return config;
    },
    (err) => Promise.reject(err)
  );

  return () => {
    UserService.axiosJWT.interceptors.request.eject(interceptor);
  };
}, [dispatch]);

// =================== Response interceptor để handle 401 ===================
useEffect(() => {
  const responseInterceptor = UserService.axiosJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token hết hạn, thử refresh
        const newToken = await refreshAccessTokenIfNeeded();
        if (newToken) {
          // Retry request với token mới
          const originalRequest = error.config;
          originalRequest.headers["token"] = `Bearer ${newToken}`;
          return UserService.axiosJWT(originalRequest);
        } else {
          // Không refresh được, logout
          dispatch(resetUser());
          localStorage.clear();
          window.location.href = '/sign-in';
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    UserService.axiosJWT.interceptors.response.eject(responseInterceptor);
  };
}, [dispatch]);

  const handleGetDetailsUser = async (id, token) => {
    try {
      const res = await UserService.getDetailsUser(id, token);
      const userData = res?.data;
      let role = "employee";
      if (userData.roles && userData.roles.includes("admin")) role = "admin";

      const userObj = {
        ...userData,
        role,
        access_token: token,
        refresh_token: localStorage.getItem("refresh_token")
          ? JSON.parse(localStorage.getItem("refresh_token"))
          : null,
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      dispatch(updateUser(userObj));
    } catch (err) {
      console.error("Lỗi lấy chi tiết user:", err);
      dispatch(resetUser());
    }
  };

  useEffect(() => {
  const initUser = async () => {
    setIsLoading(true);
    try {
      console.log("Init user: start");
      const token = await refreshAccessTokenIfNeeded();
      console.log("Init user: token after refresh check", token);
      if (token) {
        const { decoded } = handleDecoded();
        console.log("Decoded payload:", decoded);
        if (decoded?.id) {
          await handleGetDetailsUser(decoded.id, token);
        }
      }
    } catch (err) {
      console.error("Init user error:", err);
      dispatch(resetUser());
    }
    setIsLoading(false);
    console.log("Init user: done");
  };
  initUser();
}, []);


  // =================== Axios interceptor tự động refresh ===================
  useEffect(() => {
    const interceptor = UserService.axiosJWT.interceptors.request.use(
      async (config) => {
        const token = await refreshAccessTokenIfNeeded();
        console.log("Interceptor token used:", token);
        if (token) {
          config.headers["token"] = `Bearer ${token}`;
        } else {
          console.log("No valid token in interceptor → resetUser");
          dispatch(resetUser());
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    return () => {
      UserService.axiosJWT.interceptors.request.eject(interceptor);
    };
  }, [dispatch, user?.access_token]);

  // =================== Component redirect theo role ===================
  const RoleRedirect = () => {
    if (!user?.access_token) return <Navigate to="/sign-in" replace />;
    if (user.roles && user.roles.includes("admin")) return <Navigate to="/system/admin" replace />;
    return <Navigate to="/sign-in" replace />; // user bình thường
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Loading isLoading={isLoading}>
        <Router>
          <Routes>
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
                          <Route key={child.path} path={child.path} element={<child.page />} />
                        ))}
                      </Route>
                    </Route>
                  );
                }

                return (
                  <Route path={route.path} element={<Layout />} key={route.path}>
                    {route.children.map((child) => (
                      <Route key={child.path} path={child.path} element={<child.page />} />
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