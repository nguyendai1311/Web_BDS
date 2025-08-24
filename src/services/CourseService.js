import axios from "axios";

export const axiosJWT = axios.create();

export const getDetailsCourse = async (id, access_token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/course/get-details/${id}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getAllCourse = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/course/get-all`,
  );
  return res.data;
};

export const updateCourse = async (id, data, token) => {
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/course/update/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const createCourse = async (data, token) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/course/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const deleteCourse = async (id, token) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/course/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
