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

export const getLandByProjectId = async (ids, token) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("ids phải là mảng và không rỗng");
  }
  try {
    const response = await axios.post(`${API_URL}/get-by-ids`, { ids },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getHouseHoldsByIds:", error);
    throw error;
  }
};