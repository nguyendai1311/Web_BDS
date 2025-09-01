import { useDispatch, useSelector } from "react-redux";
import { setSelectedEmployees } from "../../../redux/slices/projectSlice";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Table, message, Button } from "antd";
import { useState, useEffect } from "react";
import * as EmployeeService from "../../../services/UserService";

export default function UsersByProjectPage() {
  const { id, mode } = useParams(); // projectId + mode
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Lấy dữ liệu từ Redux
  const selectedEmployees = useSelector(state => state.project?.selectedEmployees || []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (mode === "edit") {
        const allRes = await EmployeeService.getAllUser(user?.access_token);
        
        let userList = [];
        if (Array.isArray(allRes)) {
          userList = allRes;
        } else if (allRes?.success) {
          userList = allRes.data || [];
        }

        // Lọc chỉ lấy employees
        userList = userList.filter(u => u.roles?.includes("employee"));
        setUsers(userList);

        // Load selected employees từ Redux
        if (selectedEmployees.length > 0) {
          setSelectedIds(selectedEmployees.map(e => e.id));
        }
      } else if (mode === "view") {
        const res = await EmployeeService.getUsersByProject(id, user?.access_token);
        if (res?.success) {
          setUsers(res.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Có lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, mode]);

  const handleSelectEmployees = (selectedRowKeys) => {
    setSelectedIds(selectedRowKeys);
  };

  const handleConfirm = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      // Lấy thông tin chi tiết của các nhân viên đã chọn
      const selectedEmployeeDetails = await Promise.all(
        selectedIds.map(async (employeeId) => {
          try {
            const employee = users.find(u => u.id === employeeId);
            if (employee) {
              return employee;
            } else {
              // Nếu không tìm thấy trong danh sách hiện tại, gọi API
              const res = await EmployeeService.getDetailsUser(employeeId, user?.access_token);
              return res.data || res;
            }
          } catch (error) {
            console.error(`Error fetching employee ${employeeId}:`, error);
            return null;
          }
        })
      );

      // Lọc bỏ các giá trị null
      const validEmployees = selectedEmployeeDetails.filter(Boolean);

      // Cập nhật Redux
      dispatch(setSelectedEmployees(validEmployees));

      localStorage.setItem(
        "reopenModal",
        JSON.stringify({ type: "edit", projectId: id })
      );

      message.success("Cập nhật nhân viên thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra!");
    }
  };

  const handleBackView = () => {
    localStorage.setItem(
      "reopenModal",
      JSON.stringify({ type: "view", projectId: id })
    );
    navigate(-1);
  };

  const handleCancel = () => {
    localStorage.setItem(
      "reopenModal",
      JSON.stringify({ type: "edit", projectId: id })
    );
    navigate(-1);
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { 
      title: "Vai trò", 
      dataIndex: "roles", 
      key: "roles",
      render: (roles) => Array.isArray(roles) ? roles.join(", ") : roles
    },
  ];

  return (
    <Card
      title={`Danh sách Nhân viên trong dự án (${mode === "view" ? "Xem" : "Sửa"})`}
      style={{ margin: 24 }}
    >
      <Spin spinning={loading}>
        <Table
          dataSource={users}
          rowKey="id"
          rowSelection={
            mode === "edit"
              ? {
                  type: "checkbox",
                  selectedRowKeys: selectedIds,
                  onChange: handleSelectEmployees,
                }
              : undefined
          }
          columns={columns}
          pagination={{ pageSize: 10 }}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          {mode === "edit" ? (
            <>
              <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                onClick={handleConfirm}
                disabled={!selectedIds.length}
              >
                Xác nhận
              </Button>
            </>
          ) : (
            <Button onClick={handleBackView}>Quay lại</Button>
          )}
        </div>
      </Spin>
    </Card>
  );
}
