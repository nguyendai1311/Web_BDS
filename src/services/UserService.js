import axios from "axios";

export const axiosJWT = axios.create();


console.log("API_URL:", );

export const loginUser = async (data) => {
  const res = await axios.post(
     `${process.env.REACT_APP_API_URL}/users/sign-in`,
    data
  );
  return res.data;
};

export const createUser = async (data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/create-user`,
      data,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Lỗi createUser:", error.response?.data || error);
    throw {
      status: "ERR",
      message: error.response?.data?.message || "Thêm nhân viên thất bại.",
    };
  }
};

export const sendOtp = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/user/send-otp`,
      data
    );
    return res.data;
  } catch (error) {
    throw {
      status: "ERR",
      message: error.response?.data?.message || "Có lỗi xảy ra khi gửi OTP.",
    };
  }
};

export const resetPassword = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/users/reset-password`,
    data
  );
  return res.data;
};

export const resendOtp = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/users/resend-otp`,
    data
  );
  return res.data;
};

export const getDetailsUser = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/users/get-details/${id}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const deleteUser = async (id, access_token) => {
  try {
    const res = await axiosJWT.delete(
      `${process.env.REACT_APP_API_URL}/users/delete-user/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Lỗi deleteUser:", error.response?.data || error);
    throw {
      status: "ERR",
      message: error.response?.data?.message || "Xóa nhân viên thất bại.",
    };
  }
};

export const getAllUser = async (access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/users/get-all`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const refreshToken = async (refreshToken) => {
  console.log("refreshToken", refreshToken);
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/users/refresh-token`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/log-out`);
  return res.data;
};

export const updateUser = async (id, data, access_token) => {
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/user/update-user/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getUsersByProject = async (projectId, token, page = 1, limit = 20) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/get-by-ids`, {
    params: { projectId, page, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};