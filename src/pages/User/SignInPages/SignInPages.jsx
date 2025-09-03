import { jwtDecode } from "jwt-decode"
import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import * as UserService from "../../../services/UserService"
import { useMutationHooks } from "../../../hooks/useMutationHooks"
import { updateUser } from "../../../redux/slices/userSlice"
import InputForm from "../../../components/InputForm/InputForm"
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent"
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SignInPages = () => {
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const mutation = useMutationHooks((data) => UserService.loginUser(data))
  const { data, isSuccess, isError, error } = mutation

  useEffect(() => {
    if (isSuccess && data?.access_token) {
      localStorage.setItem("access_token", JSON.stringify(data.access_token))
      localStorage.setItem("refresh_token", JSON.stringify(data.refresh_token))
      const decoded = jwtDecode(data.access_token)
      if (decoded?.id) handleGetDetailsUser(decoded.id, data.access_token)
    }

    if (isError) {
      const errorMessage =
        error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      toast.error(errorMessage)
    }
  }, [isSuccess, isError, error])

  const handleGetDetailsUser = async (id, token) => {
    const refreshToken = JSON.parse(localStorage.getItem("refresh_token"))
    try {
      const res = await UserService.getDetailsUser(id, token)
      const userData = res?.data
      let role = "employee"
      if (userData.roles && userData.roles.includes("admin")) role = "admin"

      const userObj = { ...userData, role, access_token: token, refresh_token: refreshToken }
      localStorage.setItem("user", JSON.stringify(userObj))
      dispatch(updateUser(userObj))

      if (role === "admin") {
        navigate("/system/admin", { replace: true })
      } else {
        const redirectPath = location.state?.from || "/"
        navigate(redirectPath, { replace: true })
      }

      toast.success("Đăng nhập thành công!")
    } catch (err) {
      toast.error("Không thể lấy thông tin người dùng.")
    }
  }

  const handleSignIn = () => {
    if (!email || !password) {
      toast.warning("Vui lòng điền đầy đủ thông tin.")
      return
    }
    mutation.mutate({ email, password })
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-blue-500">
      {/* Optional overlay nếu muốn sáng/xám */}
      {/* <div className="absolute inset-0 bg-blue-500 opacity-50"></div> */}

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl shadow-lg rounded-lg overflow-hidden bg-white">
        {/* Left side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-400 p-8">
          <img
            src="https://qlvb.tphcm.gov.vn/qlvbdh/login/img/logo-header.png"
            alt="logo"
            className="w-32 h-32 mb-4 broder-radius"
          />
          <h1 className="text-yellow-400 font-bold text-xl text-center">
            HỆ THỐNG QUẢN LÝ LƯU TRỮ VÀ ĐIỀU HÀNH
          </h1>
          <p className="text-white text-center mt-2">
            BAN BỒI THƯỜNG GIẢI PHÓNG MẶT BẰNG
          </p>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-8 bg-white flex flex-col justify-center">
          <h2 className="text-center text-red-600 font-bold text-lg mb-4">
            Hệ thống Quản lý văn bản dùng chung
          </h2>

          <InputForm
            placeholder="Tên truy cập"
            value={email}
            onChange={setEmail}
            className="w-full mb-4"
          />

          <div className="relative mb-4">
            <InputForm
              placeholder="Mật khẩu"
              type={isShowPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              className="w-full pr-10"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setIsShowPassword((prev) => !prev)}
            >
              {isShowPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </span>
          </div>

          <ButtonComponent
            onClick={handleSignIn}
            disabled={!email || !password}
            textbutton="ĐĂNG NHẬP"
            styleButton={{
              background: "#1D4ED8", // xanh đậm
              color: "#fff",
              height: "45px",
              width: "100%",
              borderRadius: "4px",
              margin: "10px 0",
            }}
          />

          <p
            className="text-right text-sm text-blue-500 cursor-pointer hover:underline mt-2"
            onClick={() => navigate("/forgot-password")}
          >
            Quên mật khẩu?
          </p>

          <div className="mt-6 flex justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/43/SSO_icon.png"
              alt="SSO"
              className="w-12 h-12"
            />
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default SignInPages
