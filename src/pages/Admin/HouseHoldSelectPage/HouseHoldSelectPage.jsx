import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Button, Table, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedHouseholds } from "../../../redux/slices/projectSlice";
import * as HouseholdService from "../../../services/CitizenService";

export default function DetailPage() {
  const { id, mode } = useParams(); // mode = view | add | edit
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const selectedHouseholds = useSelector(
    (state) => state.project?.selectedHouseholds || []
  );

  // ================== Fetch data ==================
  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let householdList = [];

      if (mode === "add" || mode === "edit") {
        const allRes = await HouseholdService.getAll(user?.access_token);
        householdList = Array.isArray(allRes) ? allRes : allRes?.data || [];
        setHouseholds(householdList);
        setPagination({ total: householdList.length, page, pageSize });

        // FIX: Load selectedRowKeys từ nhiều nguồn
        if (mode === "edit") {
          let initialSelectedIds = [];
          
          // Kiểm tra tempFormData trước
          const tempFormData = localStorage.getItem("tempFormData");
          if (tempFormData) {
            try {
              const tempData = JSON.parse(tempFormData);
              if (tempData.selectedHouseholds && tempData.selectedHouseholds.length > 0) {
                // Xử lý selectedHouseholds từ tempFormData
                if (typeof tempData.selectedHouseholds[0] === 'string') {
                  initialSelectedIds = tempData.selectedHouseholds;
                } else if (typeof tempData.selectedHouseholds[0] === 'object') {
                  initialSelectedIds = tempData.selectedHouseholds.map(h => h.id);
                }
                console.log("Loaded from tempFormData:", initialSelectedIds);
              }
            } catch (e) {
              console.error("Error parsing tempFormData:", e);
            }
          }

          // Nếu không có trong tempFormData, lấy từ Redux
          if (initialSelectedIds.length === 0 && selectedHouseholds.length > 0) {
            if (typeof selectedHouseholds[0] === 'string') {
              initialSelectedIds = selectedHouseholds;
            } else if (typeof selectedHouseholds[0] === 'object' && selectedHouseholds[0]?.id) {
              initialSelectedIds = selectedHouseholds.map(h => h.id);
            }
            console.log("Loaded from Redux:", initialSelectedIds);
          }

          // Nếu vẫn không có, lấy từ API project households
          if (initialSelectedIds.length === 0 && id && id !== "new") {
            try {
              const projectRes = await HouseholdService.getHouseholdsByProject(id, 1, 1000, "", user?.access_token);
              if (projectRes?.success && projectRes.data) {
                initialSelectedIds = projectRes.data.map(h => h.id);
                console.log("Loaded from project API:", initialSelectedIds);
              }
            } catch (error) {
              console.error("Error fetching project households:", error);
            }
          }

          setSelectedRowKeys(initialSelectedIds);
        }
      }

      if (mode === "view" && id) {
        const res = await HouseholdService.getHouseholdsByProject(
          id,
          page,
          pageSize,
          "",
          user?.access_token
        );
        if (res?.success) {
          setHouseholds(res.data || []);
          setPagination({ total: res.total, page: res.page, pageSize: res.limit });
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

  // Thêm useEffect để sync với Redux khi selectedHouseholds thay đổi từ bên ngoài
  useEffect(() => {
    if (mode === "edit" && selectedHouseholds.length > 0) {
      // FIX: Kiểm tra xem selectedHouseholds là array of IDs hay array of objects
      let reduxSelectedIds = [];
      
      if (typeof selectedHouseholds[0] === 'string') {
        // Nếu là array of strings (IDs)
        reduxSelectedIds = selectedHouseholds;
      } else if (typeof selectedHouseholds[0] === 'object' && selectedHouseholds[0]?.id) {
        // Nếu là array of objects
        reduxSelectedIds = selectedHouseholds.map(h => h.id);
      }
      
      console.log("=== Redux Sync Households ===");
      console.log("selectedHouseholds type:", typeof selectedHouseholds[0]);
      console.log("reduxSelectedIds:", reduxSelectedIds);
      
      setSelectedRowKeys(reduxSelectedIds);
    }
  }, [selectedHouseholds, mode]);

  // ================== Confirm chọn hộ dân ==================
  const handleConfirm = () => {
    try {
      const validHouseholds = selectedRowKeys.map(id => ({ id }));

      // Cập nhật Redux
      dispatch(setSelectedHouseholds(validHouseholds));

      // Lấy tempFormData hiện tại
      const existingTempData = JSON.parse(localStorage.getItem("tempFormData") || "{}");

      const updatedTempData = {
        ...existingTempData,
        selectedHouseholds: validHouseholds,
        selectedEmployees: existingTempData.selectedEmployees || [],
        selectedLandPrices: existingTempData.selectedLandPrices || [],
        formValues: existingTempData.formValues || {},
        timestamp: Date.now(),
        lastModified: "households",
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

      console.log("=== Updated Household Data ===");
      console.log("Selected Households:", validHouseholds);
      console.log("TempFormData:", updatedTempData);

      message.success("Đã chọn/cập nhật hộ dân thành công!");
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
    { title: "Mã hộ dân", dataIndex: "maHoDan", key: "maHoDan" },
    { title: "Chủ hộ", dataIndex: "hoTenChuSuDung", key: "hoTenChuSuDung" },
    { title: "Địa chỉ", dataIndex: "diaChiThuongTru", key: "diaChiThuongTru" },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/detail/household/${record.id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // ===== DEBUG: Log để tracking =====
  useEffect(() => {
    console.log("=== HouseholdDetailPage State ===");
    console.log("Selected Row Keys:", selectedRowKeys);
    console.log("Redux selectedHouseholds:", selectedHouseholds);
    console.log("Households length:", households.length);
    console.log("Mode:", mode);
    console.log("TempFormData:", localStorage.getItem("tempFormData"));
  }, [selectedRowKeys, selectedHouseholds, households, mode]);

  return (
    <Card
      title={`Danh sách Hộ dân trong dự án (${mode === "view" ? "Xem" : mode === "add" ? "Thêm" : "Sửa"})`}
      style={{ margin: 24 }}
      extra={
        (mode === "add" || mode === "edit") && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Đã chọn: {selectedRowKeys.length} hộ dân
          </div>
        )
      }
    >
      <Spin spinning={loading}>
        <Table
          dataSource={households}
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
              {mode === "add" ? "Xác nhận chọn" : "Cập nhật"} ({selectedRowKeys.length} hộ dân)
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