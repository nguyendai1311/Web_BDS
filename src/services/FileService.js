import axios from "axios";

export async function uploadFile(data, token) {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/file/upload`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, 
      },
    }
  );
  return res.data;
}
