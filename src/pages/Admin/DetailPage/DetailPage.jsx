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

  // Lấy dữ liệu từ Redux
  const selectedHouseholds = useSelector(state => state.project?.selectedHouseholds || []);

  // ================== Fetch data ==================
  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (mode === "edit" || mode === "add") {
        // Lấy tất cả hộ dân
        const allRes = await HouseholdService.getAll(user?.access_token);
        if (allRes) {
          const householdList = Array.isArray(allRes) ? allRes : (allRes.data || []);
          setHouseholds(householdList);
          setPagination({
            total: householdList.length,
            page: page,
            pageSize: pageSize
          });
        }

        // Nếu là edit thì load hộ dân đã thuộc dự án từ Redux
        if (mode === "edit" && id && selectedHouseholds.length > 0) {
          setSelectedRowKeys(selectedHouseholds.map(h => h.id));
        }
      }

      if (mode === "view" && id) {
        // Chỉ lấy hộ dân trong dự án
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

  // ================== Confirm chọn hộ dân ==================
  const handleConfirm = async () => {
    try {
      // Chỉ cần id thôi, không cần gọi lại API chi tiết
      const validHouseholds = selectedRowKeys.map(id => ({ id }));

      if (mode === "add") {
        // Lưu vào Redux cho dự án mới
        dispatch(setSelectedHouseholds(validHouseholds));
        message.success("Đã chọn hộ dân cho dự án mới!");
      } else if (mode === "edit" && id) {
        // Cập nhật Redux cho dự án đang sửa
        dispatch(setSelectedHouseholds(validHouseholds));
        message.success("Đã cập nhật hộ dân cho dự án!");
      }

      // Quay lại và mở modal
      localStorage.setItem(
        "reopenModal",
        JSON.stringify({
          type: mode === "add" ? "add" : "edit",
          projectId: id === "new" ? "new" : id
        })
      );

      navigate(-1);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra!");
    }
  };


  // ================== Quay lại (View mode) ==================
  const handleBackView = () => {
    localStorage.setItem(
      "reopenModal",
      JSON.stringify({ type: "view", projectId: id })
    );
    navigate(-1);
  };

  // ================== Quay lại không lưu ==================
  const handleCancel = () => {
    if (mode === "add") {
      localStorage.setItem(
        "reopenModal",
        JSON.stringify({
          type: "add",
          projectId: "new",
          restoreData: JSON.parse(localStorage.getItem("tempProjectData") || "{}")
        })
      );
    } else {
      localStorage.setItem(
        "reopenModal",
        JSON.stringify({ type: mode, projectId: id })
      );
    }
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

  return (
    <Card
      title={`Danh sách Hộ dân trong dự án (${mode === "view" ? "Xem" : mode === "add" ? "Thêm" : "Sửa"})`}
      style={{ margin: 24 }}
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
            <Button
              style={{ marginRight: 8 }}
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={!selectedRowKeys.length}
            >
              {mode === "add" ? "Xác nhận chọn" : "Cập nhật"}
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
