import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/households`;

// GET theo năm
export const getCompletedByYear = async (year) => {
  const res = await axios.get(`${API_URL}/completed-by-year`, {
    params: { year },
  });
  return res.data; 
};

// GET theo tháng
export const getCompletedByMonth = async (year, month) => {
  const res = await axios.get(`${API_URL}/completed-by-month`, {
    params: { year, month },
  });
  return res.data; 
};
