import axios from "axios";
export const axiosJWT = axios.create();

export const getMonthlyRevenue = async (year) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/statistics/get-monthly-revenue?year=${year}`);
  return res.data;
};

export const getCourseStudentDistribution = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/statistics/get-course-distribution`);
  return res.data;
};

export const getStudentGrowth = async (year) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/statistics/get-student-growth?year=${year}`);
  return res.data;
};
