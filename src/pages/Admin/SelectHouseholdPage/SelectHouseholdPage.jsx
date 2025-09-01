import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import * as HouseholdService from "../../../services/CitizenService";
import { useNavigate } from "react-router-dom";

export default function SelectHouseholdPage() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🟢 Lấy danh sách hộ dân từ API
  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await HouseholdService.getAll(user?.access_token);
      const list =
        res?.data?.map((h, i) => ({
          key: h.id || i.toString(),
          id: h.id,
          ownerName: h.hoTenChuSuDung,
          address: h.diaChiThuongTru,
        })) || [];

      setHouseholds(list);

      // Load hộ dân đã chọn trước đó từ localStorage
      const saved =
        JSON.parse(localStorage.getItem("selectedHouseholds")) || [];
      setSelectedRowKeys(saved.map((s) => s.id));
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách hộ dân!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  // 🟢 Cột của bảng
  const columns = [
    {
      title: "Tên chủ hộ",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
  ];

  // 🟢 Xử lý chọn checkbox
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 🟢 Lưu hộ dân đã chọn và quay lại
  const handleSave = () => {
    const selected = households.filter((h) =>
      selectedRowKeys.includes(h.id || h.key)
    );
    localStorage.setItem("selectedHouseholds", JSON.stringify(selected));
    message.success("Đã lưu danh sách hộ dân!");
    navigate(-1); // Quay lại trang trước (ProjectPage)
  };

  return (
    <div>
      <h2>Chọn hộ dân</h2>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={columns}
        dataSource={households}
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
