import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Button, Table, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedEmployees } from "../../../redux/slices/projectSlice";
import * as EmployeeService from "../../../services/UserService";

export default function UsersByProjectPage() {
  const { id, mode } = useParams(); // mode = view | add | edit
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const selectedEmployees = useSelector(
    (state) => state.project?.selectedEmployees || []
  );

  // ================== Fetch data ==================
  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let userList = [];

      if (mode === "add" || mode === "edit") {
        const allRes = await EmployeeService.getAllUser(user?.access_token);
        if (Array.isArray(allRes)) {
          userList = allRes;
        } else if (allRes?.success) {
          userList = allRes.data || [];
        }
        userList = userList.filter(u => u.roles?.includes("employee"));
        setUsers(userList);
        setPagination({ total: userList.length, page, pageSize });

        // FIX: Load selectedRowKeys từ nhiều nguồn
        if (mode === "edit") {
          let initialSelectedIds = [];
          
          // Kiểm tra tempFormData trước
          const tempFormData = localStorage.getItem("tempFormData");
          if (tempFormData) {
            try {
              const tempData = JSON.parse(tempFormData);
              if (tempData.selectedEmployees && tempData.selectedEmployees.length > 0) {
                // Xử lý selectedEmployees từ tempFormData
                if (typeof tempData.selectedEmployees[0] === 'string') {
                  initialSelectedIds = tempData.selectedEmployees;
                } else if (typeof tempData.selectedEmployees[0] === 'object') {
                  initialSelectedIds = tempData.selectedEmployees.map(e => e.id);
                }
                console.log("Loaded from tempFormData:", initialSelectedIds);
              }
            } catch (e) {
              console.error("Error parsing tempFormData:", e);
            }
          }

          // Nếu không có trong tempFormData, lấy từ Redux
          if (initialSelectedIds.length === 0 && selectedEmployees.length > 0) {
            if (typeof selectedEmployees[0] === 'string') {
              initialSelectedIds = selectedEmployees;
            } else if (typeof selectedEmployees[0] === 'object' && selectedEmployees[0]?.id) {
              initialSelectedIds = selectedEmployees.map(e => e.id);
            }
            console.log("Loaded from Redux:", initialSelectedIds);
          }

          // Nếu vẫn không có, lấy từ API project employees
          if (initialSelectedIds.length === 0 && id && id !== "new") {
            try {
              const projectRes = await EmployeeService.getUsersByProject(id, user?.access_token);
              if (projectRes?.success && projectRes.data) {
                initialSelectedIds = projectRes.data.map(e => e.id);
                console.log("Loaded from project API:", initialSelectedIds);
              }
            } catch (error) {
              console.error("Error fetching project employees:", error);
            }
          }

          setSelectedRowKeys(initialSelectedIds);
        }
      }

      if (mode === "view" && id) {
        const res = await EmployeeService.getUsersByProject(id, user?.access_token);
        if (res?.success) {
          setUsers(res.data || []);
          setPagination({ total: res.data?.length || 0, page, pageSize });
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Có lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, [id, mode]);

  // Thêm useEffect để sync với Redux khi selectedEmployees thay đổi từ bên ngoài
  useEffect(() => {
    if (mode === "edit" && selectedEmployees.length > 0) {
      // FIX: Kiểm tra xem selectedEmployees là array of IDs hay array of objects
      let reduxSelectedIds = [];
      
      if (typeof selectedEmployees[0] === 'string') {
        // Nếu là array of strings (IDs)
        reduxSelectedIds = selectedEmployees;
      } else if (typeof selectedEmployees[0] === 'object' && selectedEmployees[0]?.id) {
        // Nếu là array of objects
        reduxSelectedIds = selectedEmployees.map(e => e.id);
      }
      
      console.log("=== Redux Sync Employees ===");
      console.log("selectedEmployees type:", typeof selectedEmployees[0]);
      console.log("reduxSelectedIds:", reduxSelectedIds);
      
      setSelectedRowKeys(reduxSelectedIds);
    }
  }, [selectedEmployees, mode]);

  // ================== Confirm chọn nhân viên ==================
  const handleConfirm = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const selectedEmployeeDetails = await Promise.all(
        selectedRowKeys.map(async (employeeId) => {
          const emp = users.find(u => u.id === employeeId);
          if (emp) return emp;
          const res = await EmployeeService.getDetailsUser(employeeId, user?.access_token);
          return res.data || res;
        })
      );

      const validEmployees = selectedEmployeeDetails.filter(Boolean);

      // Cập nhật Redux
      dispatch(setSelectedEmployees(validEmployees));

      // Lấy tempFormData hiện tại
      const existingTempData = JSON.parse(localStorage.getItem("tempFormData") || "{}");

      const updatedTempData = {
        ...existingTempData,
        selectedEmployees: validEmployees,
        selectedHouseholds: existingTempData.selectedHouseholds || [],
        selectedLandPrices: existingTempData.selectedLandPrices || [],
        formValues: existingTempData.formValues || {},
        timestamp: Date.now(),
        lastModified: "employees",
      };

      localStorage.setItem("tempFormData", JSON.stringify(updatedTempData));

      // Cập nhật reopenModal
      const reopenData = {
        type: id === "new" ? "add" : "edit",
        projectId: id === "new" ? "new" : id,
        restoreData: {
          formValues: updatedTempData.formValues,
          selectedEmployees: updatedTempData.selectedEmployees,
          selectedHouseholds: updatedTempData.selectedHouseholds,
          selectedLandPrices: updatedTempData.selectedLandPrices,
        },
      };

      localStorage.setItem("reopenModal", JSON.stringify(reopenData));

      console.log("=== Updated Employee Data ===");
      console.log("Selected Employees:", validEmployees);
      console.log("TempFormData:", updatedTempData);

      message.success("Đã chọn/cập nhật nhân viên thành công!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra!");
    }
  };

  // ================== Cancel ==================
  const handleCancel = () => {
    const existingTempData = JSON.parse(localStorage.getItem("tempFormData") || "{}");

    const reopenData = {
      type: id === "new" ? "add" : "edit",
      projectId: id === "new" ? "new" : id,
      restoreData: {
        formValues: existingTempData.formValues || {},
        selectedEmployees: existingTempData.selectedEmployees || [],
        selectedHouseholds: existingTempData.selectedHouseholds || [],
        selectedLandPrices: existingTempData.selectedLandPrices || [],
      },
    };

    localStorage.setItem("reopenModal", JSON.stringify(reopenData));
    navigate(-1);
  };

  const handleBackView = () => {
    localStorage.setItem(
      "reopenModal",
      JSON.stringify({ type: "view", projectId: id })
    );
    navigate(-1);
  };

  // ================== Columns ==================
  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { 
      title: "Vai trò", 
      dataIndex: "roles", 
      key: "roles", 
      render: roles => Array.isArray(roles) ? roles.join(", ") : roles 
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/detail/user/${record.id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // ===== DEBUG: Log để tracking =====
  useEffect(() => {
    console.log("=== EmployeeDetailPage State ===");
    console.log("Selected Row Keys:", selectedRowKeys);
    console.log("Redux selectedEmployees:", selectedEmployees);
    console.log("Users length:", users.length);
    console.log("Mode:", mode);
    console.log("TempFormData:", localStorage.getItem("tempFormData"));
  }, [selectedRowKeys, selectedEmployees, users, mode]);

  return (
    <Card
      title={`Danh sách Nhân viên trong dự án (${mode === "view" ? "Xem" : mode === "add" ? "Thêm" : "Sửa"})`}
      style={{ margin: 24 }}
      extra={
        (mode === "add" || mode === "edit") && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Đã chọn: {selectedRowKeys.length} nhân viên
          </div>
        )
      }
    >
      <Spin spinning={loading}>
        <Table
          dataSource={users}
          rowKey="id"
          rowSelection={
            mode === "add" || mode === "edit"
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                  type: "checkbox"
                }
              : undefined
          }
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
          columns={columns}
        />

        {(mode === "add" || mode === "edit") && (
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button style={{ marginRight: 8 }} onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleConfirm} disabled={!selectedRowKeys.length}>
              {mode === "add" ? "Xác nhận chọn" : "Cập nhật"} ({selectedRowKeys.length} nhân viên)
            </Button>
          </div>
        )}

        {mode === "view" && (
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button onClick={handleBackView}>Quay lại</Button>
          </div>
        )}
      </Spin>
    </Card>
  );
}