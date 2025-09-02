// pages/Admin/LandPrice/LandPricePage.js
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Input,
  Modal,
  message,
  Tooltip,
  Spin,
  Table,
  Divider,
  InputNumber,
  Space,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import * as LandPriceService from "../../../services/LandPriceService";
import {
  PageHeader,
  FilterContainer,
  HeaderActions,
  CenteredAction,
} from "./style";

const { TextArea } = Input;

export default function LandPricePage() {
  const [landPrices, setLandPrices] = useState([]);
  const [filteredLandPrices, setFilteredLandPrices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  const [editingLandPrice, setEditingLandPrice] = useState(null);
  const [viewingLandPrice, setViewingLandPrice] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("user"));

  // Hàm format thời gian Firebase
  const formatFirebaseTime = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return new Date(timestamp);
  };

  // Hàm fetch data chính
  const fetchLandPrices = async () => {
    setLoading(true);
    try {
      const res = await LandPriceService.getAll(user?.access_token);
      const data = res?.data || [];
      const list = data.map((item, index) => {
        return {
          key: item.id || index.toString(),
          id: item.id,
          land_price_id: item.land_price_id,
          land_type_name: item.land_type_name || "",
          unit: item.unit || "",
          unit_price_qd: item.unit_price_qd || 0,
          land_use_price: item.land_use_price || 0,
          coefficient: item.coefficient || 0,
          description: item.description || "",
          order_index: item.order_index || 0,
          createdAt: formatFirebaseTime(item.createdAt),
          updatedAt: formatFirebaseTime(item.updatedAt),
        };
      });

      list.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      setLandPrices(list);
      setFilteredLandPrices(list);
    } catch (err) {
      console.error("Error fetching land prices:", err);
      message.error("Không thể tải danh sách bảng giá đất");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLandPrices();
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const results = landPrices.filter(
      (item) =>
        item.land_type_name?.toLowerCase().includes(keyword) ||
        item.unit?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.land_price_id?.toLowerCase().includes(keyword)
    );
    setFilteredLandPrices(results);
  }, [searchKeyword, landPrices]);

  const handleDelete = (record) => {
    setEditingLandPrice(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingLandPrice?.id) {
      message.error("ID không hợp lệ!");
      setIsDeleteModalVisible(false);
      return;
    }
    try {
      // Sử dụng id thay vì land_price_id để xóa
      await LandPriceService.remove(editingLandPrice.id, user?.access_token);
      message.success(`Đã xóa: ${editingLandPrice.land_type_name}`);

      await fetchLandPrices();
      setIsDeleteModalVisible(false);
      setEditingLandPrice(null);
    } catch (err) {
      console.error("Error deleting land price:", err);
      message.error(err?.message || "Xóa thất bại!");
    }
  };

  const handleAddEditLandPrice = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Kiểm tra ID khi update
      if (editingLandPrice && !editingLandPrice.id) {
        message.error("ID không hợp lệ để cập nhật!");
        return;
      }

      const payload = {
        land_price_id: values.land_price_id,
        land_type_name: values.land_type_name,
        unit: values.unit || "",
        unit_price_qd: values.unit_price_qd || 0,
        land_use_price: values.land_use_price || 0,
        coefficient: values.coefficient || 0,
        description: values.description || "",
        order_index: values.order_index || 0,
      };

      let savedLandPrice;
      if (editingLandPrice) {
        // Update - sử dụng id thay vì land_price_id
        savedLandPrice = await LandPriceService.update(
          editingLandPrice.id,
          payload,
          user?.access_token
        );
        message.success("Cập nhật bảng giá thành công!");
      } else {
        // Create
        savedLandPrice = await LandPriceService.create(
          payload,
          user?.access_token
        );
        message.success("Thêm bảng giá thành công!");
      }

      // Reset form và đóng modal
      form.resetFields();
      setEditingLandPrice(null);
      setIsAddEditModalVisible(false);

      // Reload data
      await fetchLandPrices();

    } catch (err) {
      console.error("Error saving land price:", err);
      message.error(err?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Hàm xem chi tiết
  const handleViewLandPrice = async (record) => {
    try {
      setLoading(true);
      // Sử dụng id thay vì land_price_id
      const res = await LandPriceService.getById(record.id, user?.access_token);
      const data = res?.data;

      if (data) {
        // Format lại thời gian Firebase
        const formattedData = {
          ...data,
          createdAt: formatFirebaseTime(data.createdAt),
          updatedAt: formatFirebaseTime(data.updatedAt),
        };
        setViewingLandPrice(formattedData);
        setIsViewModalVisible(true);
      }
    } catch (err) {
      console.error("Error loading land price details:", err);
      message.error("Không thể tải dữ liệu chi tiết");
    } finally {
      setLoading(false);
    }
  };

  // Hàm edit
  const handleEditLandPrice = async (record) => {
    try {
      setLoading(true);
      // Sử dụng id thay vì land_price_id
      const res = await LandPriceService.getById(record.id, user?.access_token);
      const data = res?.data;

      if (data) {
        setEditingLandPrice({
          ...data,
          createdAt: formatFirebaseTime(data.createdAt),
          updatedAt: formatFirebaseTime(data.updatedAt),
        });

        form.setFieldsValue({
          land_price_id: data.land_price_id,
          land_type_name: data.land_type_name,
          unit: data.unit,
          unit_price_qd: data.unit_price_qd,
          land_use_price: data.land_use_price,
          coefficient: data.coefficient,
          description: data.description,
          order_index: data.order_index,
        });
        setIsAddEditModalVisible(true);
      }
    } catch (err) {
      console.error("Error loading land price for edit:", err);
      message.error("Không thể tải dữ liệu để sửa");
    } finally {
      setLoading(false);
    }
  };

  // Format số tiền
  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const columns = [
    {
      title: "Mã đất",
      dataIndex: "land_price_id",
      width: 100,
      sorter: (a, b) => (a.land_price_id || "").localeCompare(b.land_price_id || ""),
    },
    {
      title: "Tên loại đất/vị trí",
      dataIndex: "land_type_name",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Đơn giá theo QĐ",
      dataIndex: "unit_price_qd",
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {formatCurrency(value)} đồng
        </div>
      ),
      sorter: (a, b) => a.unit_price_qd - b.unit_price_qd,
    },
    {
      title: "Giá quyền sử dụng",
      dataIndex: "land_use_price",
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {formatCurrency(value)} đồng
        </div>
      ),
      sorter: (a, b) => a.land_use_price - b.land_use_price,
    },
    {
      title: "Hệ số",
      dataIndex: "coefficient",
      width: 100,
      align: 'center',
      render: (value) => value?.toFixed(4) || "0.0000",
      sorter: (a, b) => a.coefficient - b.coefficient,
    },
    {
      title: "Diễn giải",
      dataIndex: "description",
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <span>{text || "Không có"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <CenteredAction>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewLandPrice(record)}
            />
          </Tooltip>

          <Tooltip title="Sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditLandPrice(record)}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </CenteredAction>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageHeader>
        <h2>Quản lý bảng giá đất</h2>
      </PageHeader>

      <FilterContainer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Input
          placeholder="Tìm theo mã đất, tên loại đất, đơn vị tính..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 300, height: 40 }}
        />

        <HeaderActions>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLandPrice(null);
              form.resetFields();
              setIsAddEditModalVisible(true);
            }}
          >
            Thêm bảng giá
          </Button>
        </HeaderActions>
      </FilterContainer>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLandPrices}
          pagination={{
            pageSize: 5,
          }}
          bordered
          rowKey="key"
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Spin>

      {/* Modal xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setEditingLandPrice(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa bảng giá <strong>{editingLandPrice?.land_type_name}</strong>?
        </p>
      </Modal>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingLandPrice ? "Sửa bảng giá đất" : "Thêm bảng giá đất"}
        open={isAddEditModalVisible}
        onOk={handleAddEditLandPrice}
        onCancel={() => {
          setIsAddEditModalVisible(false);
          form.resetFields();
          setEditingLandPrice(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            coefficient: 1,
            unit_price_qd: 0,
            land_use_price: 0,
            order_index: 0,
          }}
        >
          <Form.Item
            label="Mã đất:"
            name="land_price_id"
            rules={[
              { required: true, message: "Vui lòng nhập mã đất!" },
            ]}
          >
            <Input
              placeholder="Nhập mã đất"
            />
          </Form.Item>

          {/* Tên loại đất/vị trí */}
          <Form.Item
            label="Tên loại đất/vị trí"
            name="land_type_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại đất!" },
              { max: 255, message: "Tên không được vượt quá 255 ký tự!" }
            ]}
          >
            <Input
              placeholder="Nhập tên loại đất/vị trí"
            />
          </Form.Item>

          {/* Đơn vị tính */}
          <Form.Item
            label="Đơn vị tính"
            name="unit"
          >
            <Input
              placeholder="Ví dụ: đồng/m2, đồng/m"
            />
          </Form.Item>

          <Row gutter={16}>
            {/* Đơn giá theo QĐ */}
            <Col span={12}>
              <Form.Item
                label="Đơn giá theo QĐ (đồng/m2)"
                name="unit_price_qd"
                tooltip="Giá theo quyết định UBND"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={999999999999999999}
                  step={1000}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/,/g, "")}
                  placeholder="0.00"
                  addonAfter="đồng"
                />
              </Form.Item>
            </Col>

            {/* Đơn giá quyền sử dụng đất */}
            <Col span={12}>
              <Form.Item
                label="Đơn giá quyền sử dụng đất (đồng/m2)"
                name="land_use_price"
                tooltip="Giá quyền sử dụng đất"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/,/g, "")}
                  placeholder="0.00"
                  addonAfter="đồng"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Hệ số */}
            <Col span={12}>
              <Form.Item
                label="Hệ số"
                name="coefficient"
                tooltip="Hệ số tính giá"
              >
                <InputNumber
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            {/* Thứ tự */}
            <Col span={12}>
              <Form.Item
                label="Thứ tự hiển thị"
                name="order_index"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={1}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Diễn giải */}
          <Form.Item
            label="Diễn giải"
            name="description"
            tooltip="Ghi chú/diễn giải chi tiết"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú/diễn giải chi tiết..."
              showCount
              maxLength={5000}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết bảng giá đất"
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setViewingLandPrice(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsViewModalVisible(false);
            setViewingLandPrice(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {viewingLandPrice && (
          <div>
            <Divider orientation="left">Thông tin chi tiết</Divider>

            {[
              {
                label: "ID Document",
                value: viewingLandPrice.id,
                span: 12
              },
              {
                label: "Mã đất",
                value: viewingLandPrice.land_price_id,
                span: 12
              },
              {
                label: "Tên loại đất/vị trí",
                value: viewingLandPrice.land_type_name,
                span: 24
              },
              {
                label: "Đơn vị tính",
                value: viewingLandPrice.unit || "Chưa có",
                span: 12
              },
              {
                label: "Hệ số",
                value: viewingLandPrice.coefficient?.toFixed(4) || "0.0000",
                span: 12
              },
              {
                label: "Đơn giá theo QĐ",
                value: `${formatCurrency(viewingLandPrice.unit_price_qd)} đồng`,
                span: 12,
              },
              {
                label: "Đơn giá quyền sử dụng đất",
                value: `${formatCurrency(viewingLandPrice.land_use_price)} đồng`,
                span: 12,
              },
              {
                label: "Thứ tự hiển thị",
                value: viewingLandPrice.order_index || "0",
                span: 12
              },
            ].map((field, index) => (
              <Row key={index} style={{ marginBottom: 12 }} gutter={16}>
                <Col span={field.span === 24 ? 6 : 8}>
                  <label style={{ fontWeight: 500 }}>{field.label}:</label>
                </Col>
                <Col span={field.span === 24 ? 18 : 16}>
                  <span style={field.style}>{field.value}</span>
                </Col>
              </Row>
            ))}

            {viewingLandPrice.description && (
              <>
                <Divider orientation="left">Diễn giải</Divider>
                <div style={{
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  whiteSpace: "pre-wrap",
                  minHeight: "60px"
                }}>
                  {viewingLandPrice.description || "Không có diễn giải"}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
