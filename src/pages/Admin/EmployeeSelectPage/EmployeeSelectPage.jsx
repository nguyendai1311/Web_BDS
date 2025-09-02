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
      let userList = [];

      // 1. Lấy tất cả employee
      const allRes = await EmployeeService.getAllUser(user?.access_token);
      if (Array.isArray(allRes)) {
        userList = allRes;
      } else if (allRes?.success) {
        userList = allRes.data || [];
      }
      userList = userList.filter(u => u.roles?.includes("employee"));

      if (mode === "edit") {
        // 2. Lấy employees đã thuộc dự án (API get-by-ids)
        const projectRes = await EmployeeService.getUsersByProject(id, user?.access_token);
        let existingEmployees = [];
        if (projectRes?.success) {
          existingEmployees = projectRes.data || [];
        }

        // 3. Merge các userList và existingEmployees: nếu existingEmployee chưa có trong userList thì push vào
        const userMap = new Map(userList.map(u => [u.id, u]));
        existingEmployees.forEach(e => {
          if (!userMap.has(e.id)) {
            userList.push(e);
          }
        });

        // 4. Set selectedIds từ Redux (ưu tiên) hoặc existingEmployees
        let initialSelectedIds = [];
        if (selectedEmployees.length > 0) {
          // FIX: Kiểm tra xem selectedEmployees là array of IDs hay array of objects
          if (typeof selectedEmployees[0] === 'string') {
            // Nếu là array of strings (IDs)
            initialSelectedIds = selectedEmployees;
          } else if (typeof selectedEmployees[0] === 'object' && selectedEmployees[0]?.id) {
            // Nếu là array of objects
            initialSelectedIds = selectedEmployees.map(e => e.id);
          }
        } else {
          // Nếu không có trong Redux, lấy từ existingEmployees
          initialSelectedIds = existingEmployees.map(e => e.id);
        }

        console.log("=== Initial Selection ===");
        console.log("selectedEmployees from Redux:", selectedEmployees);
        console.log("existingEmployees from API:", existingEmployees.map(e => e.id));
        console.log("initialSelectedIds:", initialSelectedIds);

        setSelectedIds(initialSelectedIds);
      }

      setUsers(userList);
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

  // Xóa useEffect thứ hai vì nó gây conflict với logic trong fetchData
  // useEffect(() => {
  //   if (mode === "edit" && users.length) {
  //     const mergedSelected = selectedEmployees.length > 0
  //       ? selectedEmployees.map(e => e.id)
  //       : users.filter(u => u.selected)?.map(u => u.id) || [];
  //     setSelectedIds(mergedSelected);
  //   }
  // }, [users, selectedEmployees, mode]);

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
      
      console.log("=== Redux Sync ===");
      console.log("selectedEmployees type:", typeof selectedEmployees[0]);
      console.log("reduxSelectedIds:", reduxSelectedIds);
      
      setSelectedIds(reduxSelectedIds);
    }
  }, [selectedEmployees, mode]);

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

      // ===== FIX: Cập nhật tempFormData với dữ liệu mới =====
      const existingTempData = localStorage.getItem("tempFormData");
      let tempData = {};

      if (existingTempData) {
        try {
          tempData = JSON.parse(existingTempData);
        } catch (e) {
          console.error("Error parsing existing tempFormData:", e);
        }
      }

      // Cập nhật với dữ liệu nhân viên mới
      const updatedTempData = {
        ...tempData,
        selectedEmployees: validEmployees,
        timestamp: Date.now(), // Thêm timestamp để track
        lastModified: "employees" // Track xem field nào được sửa cuối
      };

      localStorage.setItem("tempFormData", JSON.stringify(updatedTempData));

      // ===== FIX: Cập nhật reopenModal với dữ liệu restore =====
      const reopenData = {
        type: id === "new" ? "add" : "edit",
        projectId: id,
        restoreData: {
          formValues: tempData.formValues || null,
          selectedHouseholds: tempData.selectedHouseholds || [],
          selectedEmployees: validEmployees,
          selectedLandPrices: tempData.selectedLandPrices || []
        }
      };

      localStorage.setItem("reopenModal", JSON.stringify(reopenData));

      console.log("=== Updated Data ===");
      console.log("Selected Employees:", validEmployees);
      console.log("TempFormData:", updatedTempData);
      console.log("ReopenModal:", reopenData);

      message.success(`Đã chọn ${validEmployees.length} nhân viên!`);
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
    // ===== FIX: Giữ nguyên tempFormData khi cancel =====
    const existingTempData = localStorage.getItem("tempFormData");
    let reopenType = "edit";
    let restoreData = null;

    if (existingTempData) {
      try {
        const tempData = JSON.parse(existingTempData);
        reopenType = id === "new" ? "add" : "edit";
        restoreData = {
          formValues: tempData.formValues || null,
          selectedHouseholds: tempData.selectedHouseholds || [],
          selectedEmployees: tempData.selectedEmployees || selectedEmployees,
          selectedLandPrices: tempData.selectedLandPrices || []
        };
      } catch (e) {
        console.error("Error parsing tempFormData on cancel:", e);
      }
    }

    const reopenData = {
      type: reopenType,
      projectId: id,
      restoreData
    };

    localStorage.setItem("reopenModal", JSON.stringify(reopenData));
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

  // ===== DEBUG: Log để tracking =====
  useEffect(() => {
    console.log("=== UsersByProjectPage State ===");
    console.log("Selected IDs:", selectedIds);
    console.log("Redux selectedEmployees:", selectedEmployees);
    console.log("Users length:", users.length);
    console.log("Mode:", mode);
    console.log("TempFormData:", localStorage.getItem("tempFormData"));
  }, [selectedIds, selectedEmployees, users, mode]);

  return (
    <Card
      title={`Danh sách Nhân viên trong dự án (${mode === "view" ? "Xem" : "Sửa"})`}
      style={{ margin: 24 }}
      extra={
        mode === "edit" && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Đã chọn: {selectedIds.length} nhân viên
          </div>
        )
      }
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
                getCheckboxProps: (record) => ({
                  name: record.name,
                }),
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
                Xác nhận ({selectedIds.length} nhân viên)
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