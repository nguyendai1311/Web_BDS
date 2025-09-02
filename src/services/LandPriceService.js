import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/lands`;

export const axiosJWT = axios.create();

export async function create(data, token) {
  const res = await axios.post(`${API_URL}/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getById(id, token) {
  const res = await axios.get(`${API_URL}/get-by-id/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getAll(token) {
  const res = await axios.get(`${API_URL}/get-all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function update(id, data, token) {
  const res = await axios.put(`${API_URL}/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function remove(id, token) {
  const res = await axios.delete(`${API_URL}/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getLandByProjectId(projectId, page = 1, limit = 20, search = "", token) {
  try {
    const res = await axios.get(`${API_URL}/get-by-ids`, {
      params: {
      projectId,
      page,
      limit,
      search,
    },
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getLandByProjectId:", error);
    throw error;
  }
}