import axios from "axios";

export async function getAll(token) {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/households/get-all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getById(id, token) {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/households/get-by-id/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function create(data, token) {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/households/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function update(id, data, token) {
  const res = await axios.put(`${process.env.REACT_APP_API_URL}/households/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function remove(id, token) {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL}/households/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getHouseholdsByProject(projectId, page = 1, limit = 20, search = "", token) {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/households/get-by-ids`, {
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
}