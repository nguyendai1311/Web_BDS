import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import * as EmployeeService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";

export default function SelectEmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🟢 Lấy danh sách nhân viên từ API
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await EmployeeService.getAllUser(user?.access_token);

      // chỉ lấy user có role là employee
      const list =
        res
          ?.filter((e) => e.roles?.includes("employee"))
          .map((e, i) => ({
            key: e.id || i.toString(),
            id: e.id,
            name: e.email, // vì API không có hoTen → dùng email
            role: e.roles?.join(", ") || "employee", // hiển thị roles
          })) || [];

      setEmployees(list);

      // Load nhân viên đã chọn trước đó từ localStorage
      const saved =
        JSON.parse(localStorage.getItem("selectedEmployees")) || [];
      setSelectedRowKeys(saved.map((s) => s.id));
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 🟢 Cột của bảng
  const columns = [
    {
      title: "Email",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
    },
  ];

  // 🟢 Xử lý chọn checkbox
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 🟢 Lưu nhân viên đã chọn và quay lại
  const handleSave = () => {
    const selected = employees.filter((e) =>
      selectedRowKeys.includes(e.id || e.key)
    );
    localStorage.setItem("selectedEmployees", JSON.stringify(selected));
    message.success("Đã lưu danh sách nhân viên!");
    navigate(-1); // Quay lại trang trước (ProjectManagement)
  };

  return (
    <div>
      <h2>Chọn nhân viên</h2>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
          getCheckboxProps: (record) => ({
            disabled: record.role !== "employee", // chỉ cho chọn employee
          }),
        }}
        columns={columns}
        dataSource={employees}
        loading={loading}
      />
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <Button type="primary" onClick={handleSave}>
          Lưu và quay lại
        </Button>
        <Button onClick={() => navigate(-1)}>Hủy</Button>
      </div>
    </div>
  );
}
