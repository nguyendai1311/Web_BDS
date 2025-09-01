import { useDispatch } from "react-redux";
import { setSelectedEmployees } from "../../../redux/slices/projectSlice";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Table, message, Button } from "antd";
import { useState, useEffect } from "react";
import * as EmployeeService from "../../../services/UserService";

export default function UsersByProjectPage() {
  const { id } = useParams(); // projectId từ route
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Hàm gọi API
  const fetchUsers = async () => {
    console.log("fetchUsers called for projectId:", id);
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await EmployeeService.getUsersByProject(id, user?.access_token);
      console.log("API response:", res);
      if (res?.success) {
        setUsers(res.data || []);
      } else {
        message.error("Không thể tải danh sách nhân viên");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Có lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUsers();
  }, [id]);

  const handleSelectEmployees = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
  };

  const handleConfirm = () => {
    if (!selectedRows.length) {
      message.warning("Vui lòng chọn ít nhất 1 nhân viên!");
      return;
    }
    const selectedIds = selectedRows.map((user) => user.id);
    console.log("Selected employee IDs:", selectedIds);
    dispatch(setSelectedEmployees(selectedIds));
    message.success("Chọn nhân viên thành công!");
    navigate(-1); // quay lại trang trước, có thể sửa theo nhu cầu
  };

  return (
    <Card title="Danh sách Nhân viên trong dự án" style={{ margin: 24 }}>
      <Spin spinning={loading}>
        <Table
          dataSource={users}
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            onChange: handleSelectEmployees,
          }}
          columns={[
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Tên", dataIndex: "name", key: "name" },
            { title: "Vai trò", dataIndex: "roles", key: "roles" },
          ]}
          pagination={{ pageSize: 5 }}
        />
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button type="primary" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </div>
      </Spin>
    </Card>
  );
}
