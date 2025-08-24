import axios from "axios";

export const axiosJWT = axios.create();

const API_URL = `${process.env.REACT_APP_API_URL}/projects`;

export const getAllProjects = async (token) => {
    try {
        const res = await axiosJWT.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Lỗi khi lấy danh sách dự án" };
    }
};

export const createProject = async (data, token) => {
    try {
        const res = await axiosJWT.post(
            `${process.env.REACT_APP_API_URL}/projects/create`,
            data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Lỗi khi thêm dự án" };
    }
};

export const deleteProject = async (id, token) => {
    try {
        const res = await axiosJWT.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Lỗi khi xóa dự án" };
    }
};

export default {
    getAllProjects,
    createProject,
    deleteProject,
};
