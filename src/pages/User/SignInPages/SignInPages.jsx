import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as UserService from "../../../services/UserService";
import { useMutationHooks } from "../../../hooks/useMutationHooks";
import { updateUser } from "../../../redux/slices/userSlice";
import InputForm from "../../../components/InputForm/InputForm";
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import {
  SigninContainer,
  SigninForm,
  SigninContent,
  StyledInputWrapper,
  EyeIcon,
  ForgotLink,
  SignupLink,
  BoldText,
} from "./style";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignInPages = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const mutation = useMutationHooks((data) => UserService.loginUser(data));
  const { data, isSuccess, isError, error } = mutation;

  useEffect(() => {
    if (isSuccess && data?.access_token) {
      localStorage.setItem("access_token", JSON.stringify(data.access_token));
      localStorage.setItem("refresh_token", JSON.stringify(data.refresh_token));

      const decoded = jwtDecode(data.access_token);
      if (decoded?.id) {
        handleGetDetailsUser(decoded.id, data.access_token);
      }
    }

    if (isError) {
      const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (errorMessage.includes("email")) {
        toast.error("Email không tồn tại.");
      } else if (errorMessage.includes("password")) {
        toast.error("Sai mật khẩu hoặc định dạng mật khẩu không hợp lệ.");
      } else {
        toast.error(errorMessage);
      }
    }
  }, [isSuccess, isError, error]);

  const handleGetDetailsUser = async (id, token) => {
    const refreshToken = JSON.parse(localStorage.getItem("refresh_token"));

    try {
      const res = await UserService.getDetailsUser(id, token);
      const userData = res?.data;

      // ✅ Xác định role
      let role = "employee";
      if (userData.roles && userData.roles.includes("admin")) {
        role = "admin";
      }

      const userObj = {
        ...userData,
        role,
        access_token: token,
        refresh_token: refreshToken,
      };

      // ✅ Lưu cả user vào localStorage
      localStorage.setItem("user", JSON.stringify(userObj));

      dispatch(updateUser(userObj));

      if (role === "admin") {
        navigate("/system/admin");
      } else {
        const redirectPath = location?.state || "/";
        navigate(redirectPath);
      }

      toast.success("Đăng nhập thành công!");
    } catch (err) {
      toast.error("Không thể lấy thông tin người dùng.");
    }
  };



  const handleSignIn = () => {
    if (!email || !password) {
      toast.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning("Email không đúng định dạng.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số.");
      return;
    }

    mutation.mutate({ email, password });
  };

  return (
    <SigninContainer>
      <SigninForm>
        <SigninContent>
          <h1 style={{ textAlign: "center" }}>King Chess</h1>
          <p style={{ marginBottom: "15px", fontSize: "18px" }}>Đăng nhập</p>

          <StyledInputWrapper>
            <InputForm
              placeholder="Abc@gmail.com"
              value={email}
              onChange={(val) => setEmail(val)}
            />
          </StyledInputWrapper>

          <StyledInputWrapper style={{ position: "relative" }}>
            <EyeIcon onClick={() => setIsShowPassword((prev) => !prev)}>
              {isShowPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </EyeIcon>
            <InputForm
              placeholder="Mật khẩu"
              type={isShowPassword ? "text" : "password"}
              value={password}
              onChange={(val) => setPassword(val)}
            />
          </StyledInputWrapper>

          <ButtonComponent
            disabled={!email || !password}
            onClick={handleSignIn}
            size={40}
            styleButton={{
              background: "rgb(255, 57, 69)",
              height: "45px",
              width: "100%",
              border: "none",
              borderRadius: "4px",
              margin: "18px 0 10px",
            }}
            textbutton="Đăng nhập"
            styleTextButton={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
            }}
          />

          <ForgotLink onClick={() => navigate("/forgot-password")}>
            Quên mật khẩu?
          </ForgotLink>

        </SigninContent>
      </SigninForm>

      <ToastContainer position="top-right" autoClose={3000} />
    </SigninContainer>
  );
};

export default SignInPages;
