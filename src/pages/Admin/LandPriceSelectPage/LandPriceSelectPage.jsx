import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Button, Table, message, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedLandPrices } from "../../../redux/slices/projectSlice";
import * as LandPriceService from "../../../services/LandPriceService";

export default function LandPriceDetailPage() {
  const { id, mode } = useParams(); // mode = view | add | edit
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [landPrices, setLandPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const selectedLandPrices = useSelector(state => state.project?.selectedLandPrices || []);

  const fetchLandPricesData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let list = [];

      if (mode === "add" || mode === "edit") {
        const res = await LandPriceService.getAll(user?.access_token);
        list = Array.isArray(res?.data) ? res.data : [];
        setLandPrices(list);
        setPagination({ total: list.length, page, pageSize });

        // FIX: Load selectedRowKeys từ nhiều nguồn
        if (mode === "edit") {
          let initialSelectedIds = [];

          // Kiểm tra tempFormData trước
          const tempFormData = localStorage.getItem("tempFormData");
          if (tempFormData) {
            try {
              const tempData = JSON.parse(tempFormData);
              if (tempData.selectedLandPrices) {
                // Xử lý selectedLandPrices từ tempFormData
                let tempLandPrices = tempData.selectedLandPrices;

                // Kiểm tra nếu là string JSON
                if (typeof tempLandPrices === 'string') {
                  try {
                    tempLandPrices = JSON.parse(tempLandPrices);
                  } catch (e) {
                    console.error("Error parsing selectedLandPrices string:", e);
                    tempLandPrices = [];
                  }
                }

                if (Array.isArray(tempLandPrices) && tempLandPrices.length > 0) {
                  if (typeof tempLandPrices[0] === 'string') {
                    initialSelectedIds = tempLandPrices;
                  } else if (typeof tempLandPrices[0] === 'object' && tempLandPrices[0]?.id) {
                    initialSelectedIds = tempLandPrices.map(l => l.id);
                  }
                  console.log("Loaded land prices from tempFormData:", initialSelectedIds);
                }
              }
            } catch (e) {
              console.error("Error parsing tempFormData:", e);
            }
          }

          // Nếu không có trong tempFormData, lấy từ Redux
          if (initialSelectedIds.length === 0 && selectedLandPrices.length > 0) {
            if (typeof selectedLandPrices[0] === 'string') {
              initialSelectedIds = selectedLandPrices;
            } else if (typeof selectedLandPrices[0] === 'object' && selectedLandPrices[0]?.id) {
              initialSelectedIds = selectedLandPrices.map(l => l.id);
            }
            console.log("Loaded land prices from Redux:", initialSelectedIds);
          }

          // Nếu vẫn không có, lấy từ API project land prices
          if (initialSelectedIds.length === 0 && id && id !== "new") {
            try {
              const projectRes = await LandPriceService.getLandByProjectId(id, 1, 1000, user?.access_token);
              if (projectRes?.success && projectRes.data) {
                initialSelectedIds = projectRes.data.map(l => l.id);
                console.log("Loaded land prices from project API:", initialSelectedIds);
              }
            } catch (error) {
              console.error("Error fetching project land prices:", error);
            }
          }

          setSelectedRowKeys(initialSelectedIds);
        }
      }

      if (mode === "view" && id) {
        const res = await LandPriceService.getLandByProjectId(id,
          page,
          pageSize,
          "",
          user?.access_token);
        if (res?.success) {
          setLandPrices(res.data || []);
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
    fetchLandPricesData(1, pagination.pageSize);
  }, [id, mode]);

  // Thêm useEffect để sync với Redux khi selectedLandPrices thay đổi từ bên ngoài
  useEffect(() => {
    if (mode === "edit" && selectedLandPrices.length > 0) {
      // FIX: Kiểm tra xem selectedLandPrices là array of IDs hay array of objects
      let reduxSelectedIds = [];

      if (typeof selectedLandPrices[0] === 'string') {
        // Nếu là array of strings (IDs)
        reduxSelectedIds = selectedLandPrices;
      } else if (typeof selectedLandPrices[0] === 'object' && selectedLandPrices[0]?.id) {
        // Nếu là array of objects
        reduxSelectedIds = selectedLandPrices.map(l => l.id);
      }

      console.log("=== Redux Sync Land Prices ===");
      console.log("selectedLandPrices type:", typeof selectedLandPrices[0]);
      console.log("reduxSelectedIds:", reduxSelectedIds);

      setSelectedRowKeys(reduxSelectedIds);
    }
  }, [selectedLandPrices, mode]);

  const handleConfirm = () => {
    try {
      const selectedLandPriceDetails = selectedRowKeys.map(landPriceId => {
        const landPrice = landPrices.find(lp => lp.id === landPriceId);
        return landPrice || { id: landPriceId };
      }).filter(Boolean);

      // Cập nhật Redux
      dispatch(setSelectedLandPrices(selectedLandPriceDetails));

      // Lấy tempFormData hiện tại
      const existingTempData = JSON.parse(localStorage.getItem("tempFormData") || "{}");

      const updatedTempData = {
        ...existingTempData,
        selectedLandPrices: selectedLandPriceDetails,
        timestamp: Date.now(),
        lastModified: "landPrices",
      };

      localStorage.setItem("tempFormData", JSON.stringify(updatedTempData));

      const reopenData = {
        type: id === "new" ? "add" : "edit",
        projectId: id || "new",
        restoreData: {
          ...existingTempData, // giữ nguyên employees, households, formValues
          selectedLandPrices: selectedLandPriceDetails,
        },
      };

      localStorage.setItem("reopenModal", JSON.stringify(reopenData));


      console.log("=== Updated Land Price Data ===");
      console.log("Selected Land Prices:", selectedLandPriceDetails);
      console.log("TempFormData:", updatedTempData);

      message.success(
        mode === "add"
          ? `Đã chọn ${selectedLandPriceDetails.length} bảng giá đất cho dự án mới!`
          : `Đã cập nhật ${selectedLandPriceDetails.length} bảng giá đất cho dự án!`
      );

      navigate(-1);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra!");
    }
  };

  const handleCancel = () => {
    const existingTempData = JSON.parse(localStorage.getItem("tempFormData") || "{}");

    const reopenData = {
      type: id === "new" ? "add" : "edit",
      projectId: id || "new",
      restoreData: {
        formValues: existingTempData.formValues || {},
        selectedEmployees: existingTempData.selectedEmployees || [],
        selectedHouseholds: existingTempData.selectedHouseholds || [],
        selectedLandPrices: existingTempData.selectedLandPrices || selectedLandPrices,
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

  const columns = [
    { title: "Mã đất", dataIndex: "land_price_id", key: "land_price_id" },
    { title: "Tên loại đất/vị trí", dataIndex: "land_type_name", key: "land_type_name" },
    { title: "Đơn vị tính", dataIndex: "unit", key: "unit" },
    { title: "Đơn giá theo QĐ", dataIndex: "unit_price_qd", key: "unit_price_qd" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button type="link" onClick={() => navigate(`/detail/land/${record.id}`)}>
            Xem chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  // ===== DEBUG: Log để tracking =====
  useEffect(() => {
    console.log("=== LandPriceDetailPage State ===");
    console.log("Selected Row Keys:", selectedRowKeys);
    console.log("Redux selectedLandPrices:", selectedLandPrices);
    console.log("Land Prices length:", landPrices.length);
    console.log("Mode:", mode);
    console.log("TempFormData:", localStorage.getItem("tempFormData"));
  }, [selectedRowKeys, selectedLandPrices, landPrices, mode]);

  return (
    <Card
      title={`Danh sách Bảng giá đất (${mode === "view" ? "Xem" : mode === "add" ? "Thêm" : "Sửa"})`}
      style={{ margin: 24 }}
      extra={
        (mode === "add" || mode === "edit") && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Đã chọn: {selectedRowKeys.length} bảng giá
          </div>
        )
      }
    >
      <Spin spinning={loading}>
        <Table
          dataSource={landPrices}
          rowKey="id"
          rowSelection={
            mode === "add" || mode === "edit"
              ? {
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                type: "checkbox",
                getCheckboxProps: (record) => ({ name: record.land_type_name }),
              }
              : undefined
          }
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchLandPricesData(page, pageSize),
          }}
          columns={columns}
        />

        {(mode === "add" || mode === "edit") && (
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button style={{ marginRight: 8 }} onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleConfirm} disabled={!selectedRowKeys.length}>
              {mode === "add" ? "Xác nhận chọn" : "Cập nhật"} ({selectedRowKeys.length} bảng giá)
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