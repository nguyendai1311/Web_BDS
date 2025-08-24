import { useState, useEffect } from "react";
import { Row, Col, Upload, Button, DatePicker, Form, Input, Modal, message, Tooltip, Spin, Table, Divider, Checkbox, InputNumber } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as CitizenService from "../../../services/CitizenService";

import {
  PageHeader,
  FilterContainer,
  HeaderActions,
  CenteredAction,
} from "./style";

export default function CitizenPage() {
  const [citizens, setCitizens] = useState([]);
  const [filteredCitizens, setFilteredCitizens] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [viewingCitizen, setViewingCitizen] = useState(null);

  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (editingCitizen) {
      form.setFieldsValue(editingCitizen);
    } else {
      form.resetFields();
    }
  }, [editingCitizen]);

  // Fetch citizens
  useEffect(() => {
    const fetchCitizens = async () => {
      setLoading(true);
      try {
        const res = await CitizenService.getAll(user?.access_token);

        // Lấy mảng data từ API
        const data = res?.data || [];

        const list = data.map((cit, index) => ({
          key: cit.id || index.toString(),
          receiptNo: cit.maHoDan || "",
          fullName: cit.hoTenChuSuDung || "",
          phone: cit.soDienThoaiLienLac || "",
          address: cit.diaChiThuongTru || cit.diaChiGiaiToa || "",
          soThua: cit.soThua || "",
          soTo: cit.soTo || "",
          phuong: cit.phuong || "",
          quan: cit.quan || "",
          giaThuoc: cit.giaThuoc || "",
          thongBaoThuHoiDat: cit.thongBaoThuHoiDat || null,
          quyetDinhPheDuyet: cit.quyetDinhPheDuyet || null,
          phuongAnBTHTTDC: cit.phuongAnBTHTTDC || null,
          nhanTienBoiThuongHoTro: cit.daNhanTienBoiThuong || null,
          banGiaoMatBang: cit.daBanGiaoMatBang || null,
          tongTien: cit.tongSoTienBoiThuongHoTro || "",
          tongTienBangChu: cit.bangChu || "",
          createdAt: cit.createdAt,
          updatedAt: cit.updatedAt,
        }));

        setCitizens(list);
        setFilteredCitizens(list);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách dân cư");
      }
      setLoading(false);
    };

    fetchCitizens();
  }, [user?.access_token]);


  // Xóa citizen
  const handleDelete = (record) => {
    setEditingCitizen(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingCitizen?.key) {
      message.error("ID citizen không hợp lệ!");
      setIsDeleteModalVisible(false);
      return;
    }
    try {
      await CitizenService.remove(editingCitizen.key, user?.access_token);
      message.success(`Đã xóa dân cư: ${editingCitizen.fullName}`);
      setCitizens((prev) =>
        prev.filter((c) => c.key !== editingCitizen.key)
      );
      setFilteredCitizens((prev) =>
        prev.filter((c) => c.key !== editingCitizen.key)
      );
      setIsDeleteModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Xóa thất bại!");
    }
  };

  // Thêm/Sửa citizen
  // const handleAddEditCitizen = async () => {
  //   try {
  //     const values = await form.validateFields();
  //     setSaving(true);

  //     if (editingCitizen) {
  //       // update
  //       const updated = await CitizenService.update(
  //         editingCitizen.key,
  //         values,
  //         user?.access_token
  //       );
  //       const updatedCitizen = { key: updated.id, ...updated };

  //       setCitizens((prev) =>
  //         prev.map((c) => (c.key === updatedCitizen.key ? updatedCitizen : c))
  //       );
  //       setFilteredCitizens((prev) =>
  //         prev.map((c) => (c.key === updatedCitizen.key ? updatedCitizen : c))
  //       );

  //       message.success("Cập nhật dân cư thành công!");
  //     } else {
  //       // create
  //       const newCit = await CitizenService.create(values, user?.access_token);
  //       const newCitizen = { key: newCit.id, ...newCit };

  //       setCitizens((prev) => [...prev, newCitizen]);
  //       setFilteredCitizens((prev) => [...prev, newCitizen]);

  //       message.success("Thêm dân cư thành công!");
  //     }

  //     form.resetFields();
  //     setEditingCitizen(null);
  //     setIsAddEditModalVisible(false);
  //   } catch (err) {
  //     console.error(err);
  //     message.error(err?.message || "Lưu thất bại!");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleAddEditCitizen = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Chuẩn hóa nested object + upload
      const normalizedValues = {
        ...values,
        thongBaoThuHoiDat: values.thongBaoThuHoiDat
          ? {
            so: values.thongBaoThuHoiDat.so || "",
            ngay: values.thongBaoThuHoiDat.ngay || null,
            dinhKem: (values.thongBaoThuHoiDat.dinhKem || []).map(
              (f) => f.url || f.originFileObj
            ),
          }
          : null,
        quyetDinhPheDuyet: values.quyetDinhPheDuyet
          ? {
            so: values.quyetDinhPheDuyet.so || "",
            ngay: values.quyetDinhPheDuyet.ngay || null,
            dinhKem: (values.quyetDinhPheDuyet.dinhKem || []).map(
              (f) => f.url || f.originFileObj
            ),
          }
          : null,
        phuongAnBTHTTDC: values.phuongAnBTHTTDC
          ? {
            so: values.phuongAnBTHTTDC.so || "",
            ngay: values.phuongAnBTHTTDC.ngay || null,
            dinhKem: (values.phuongAnBTHTTDC.dinhKem || []).map(
              (f) => f.url || f.originFileObj
            ),
          }
          : null,
        nhanTienBoiThuongHoTro: values.nhanTienBoiThuongHoTro || { xacNhan: false, ngay: null, dinhKem: [] },
        banGiaoMatBang: values.banGiaoMatBang || { xacNhan: false, ngay: null, dinhKem: [] },
      };

      // Nếu đang sửa, merge dữ liệu cũ + mới
      const payload = editingCitizen
        ? { ...editingCitizen, ...normalizedValues, updatedAt: new Date().toISOString() }
        : normalizedValues;

      let savedCitizen;
      if (editingCitizen) {
        savedCitizen = await CitizenService.update(editingCitizen.key, payload, user?.access_token);
        message.success("Cập nhật dân cư thành công!");
      } else {
        savedCitizen = await CitizenService.create(payload, user?.access_token);
        message.success("Thêm dân cư thành công!");
      }

      // Cập nhật state
      const citizenItem = { key: savedCitizen.id, ...savedCitizen };
      if (editingCitizen) {
        setCitizens((prev) => prev.map((c) => (c.key === citizenItem.key ? citizenItem : c)));
        setFilteredCitizens((prev) => prev.map((c) => (c.key === citizenItem.key ? citizenItem : c)));
      } else {
        setCitizens((prev) => [...prev, citizenItem]);
        setFilteredCitizens((prev) => [...prev, citizenItem]);
      }

      form.resetFields();
      setEditingCitizen(null);
      setIsAddEditModalVisible(false);

    } catch (err) {
      console.error(err);
      message.error(err?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };


  // Tìm kiếm
  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const results = citizens.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(keyword) ||
        c.receiptNo?.toLowerCase().includes(keyword) ||
        c.phone?.toLowerCase().includes(keyword)
    );
    setFilteredCitizens(results);
  }, [searchKeyword, citizens]);

  const columns = [
    { title: "Biên nhận", dataIndex: "receiptNo", key: "receiptNo" },
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Số thửa", dataIndex: "soThua", key: "soThua" },
    { title: "Số tờ", dataIndex: "soTo", key: "soTo" },
    { title: "Phường", dataIndex: "phuong", key: "phuong" },
    { title: "Quận", dataIndex: "quan", key: "quan" },
    { title: "Giá thuộc", dataIndex: "giaThuoc", key: "giaThuoc" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <CenteredAction>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setViewingCitizen(record);
                setIsViewModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCitizen(record);
                form.setFieldsValue(record);
                setIsAddEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa">
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
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
        <h2>Quản lý dân cư</h2>
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
          placeholder="Tìm theo tên, số biên nhận, SĐT"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 300, height: 40 }}
        />

        <HeaderActions>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCitizen(null);
              form.resetFields();
              setIsAddEditModalVisible(true);
            }}
          >
            Thêm dân cư
          </Button>
        </HeaderActions>
      </FilterContainer>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredCitizens}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Spin>

      {/* Modal xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa {editingCitizen?.fullName}?</p>
      </Modal>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingCitizen ? "Sửa thông tin hộ dân" : "Thêm hộ dân"}
        open={isAddEditModalVisible}
        onOk={handleAddEditCitizen}
        onCancel={() => {
          setIsAddEditModalVisible(false);
          form.resetFields();
          setEditingCitizen(null);
        }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={saving}
        width={1400}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Divider orientation="left">Thông tin hộ dân</Divider>

          {/* --- Thông tin cơ bản --- */}
          {[
            { label: "Mã hộ dân", name: "maHoDan" },
            { label: "Họ và tên chủ sử dụng", name: "hoTenChuSuDung" },
            { label: "Địa chỉ thường trú", name: "diaChiThuongTru" },
            { label: "Số điện thoại liên lạc", name: "soDienThoaiLienLac" },
            { label: "Địa chỉ giải tỏa", name: "diaChiGiaiToa" },
          ].map((field) => (
            <Row gutter={16} key={field.name} style={{ marginBottom: 16 }} align="middle">
              <Col span={4}>
                <label style={{ fontWeight: 500 }}>{field.label}:</label>
              </Col>
              <Col span={8}>
                <Form.Item name={field.name} style={{ marginBottom: 0 }}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          ))}

          {/* --- Số thửa, tờ theo BĐĐC 2002 --- */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Số thửa, tờ theo BĐĐC 2002:</label></Col>
            <Col span={4}><Form.Item name="soThua"><Input placeholder="Số thửa" /></Form.Item></Col>
            <Col span={4}><Form.Item name="soTo"><Input placeholder="Số tờ" /></Form.Item></Col>
            <Col span={6}><Form.Item name="phuong"><Input placeholder="Phường" /></Form.Item></Col>
            <Col span={6}><Form.Item name="quan"><Input placeholder="Quận" /></Form.Item></Col>
          </Row>

          {/* --- Các object nested --- */}
          {[
            { label: "Thông báo thu hồi đất", name: "thongBaoThuHoiDat" },
            { label: "Quyết định phê duyệt", name: "quyetDinhPheDuyet" },
            { label: "Phương án BT, HT, TĐC", name: "phuongAnBTHTTDC" },
            { label: "Đã nhận tiền bồi thường, hỗ trợ", name: "nhanTienBoiThuongHoTro", isCheckbox: true },
            { label: "Đã bàn giao mặt bằng", name: "banGiaoMatBang", isCheckbox: true },
          ].map((field) => (
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }} key={field.name}>
              <Col span={4}><label>{field.label}:</label></Col>

              {/* Số / checkbox */}
              <Col span={2}>
                <Form.Item
                  name={field.isCheckbox ? [field.name, "xacNhan"] : [field.name, "so"]}
                  valuePropName={field.isCheckbox ? "checked" : undefined}
                  style={{ marginBottom: 0 }}
                >
                  {field.isCheckbox ? <Checkbox /> : <Input placeholder="Số" />}
                </Form.Item>
              </Col>

              {/* Ngày */}
              <Col span={8}>
                <Form.Item
                  name={[field.name, "ngay"]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn ngày" />
                </Form.Item>
              </Col>

              {/* Upload */}
              <Col span={8}>
                <Form.Item
                  name={[field.name, "dinhKem"]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList || []}
                  style={{ marginBottom: 0 }}
                >
                  <Upload listType="text">
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          ))}

          {/* --- Tổng số tiền bồi thường --- */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Tổng số tiền bồi thường hỗ trợ:</label></Col>
            <Col span={6}>
              <Form.Item name="tongTien">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/,/g, "")}
                  placeholder="Nhập số tiền"
                  addonAfter="đồng"
                  controls={false}
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="tongTienBangChu">
                <Input placeholder="Bằng chữ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết dân cư"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={1200}
      >
        {viewingCitizen && (
          <div>
            {/* --- Thông tin cơ bản --- */}
            <Divider orientation="left">Thông tin cơ bản</Divider>

            {[
              { label: "Biên nhận", value: viewingCitizen.receiptNo },
              { label: "Họ tên", value: viewingCitizen.fullName },
              { label: "SĐT", value: viewingCitizen.phone },
              { label: "Địa chỉ", value: viewingCitizen.address },
            ].map((field, index) => (
              <Row key={index} style={{ marginBottom: 12 }} align="middle">
                <Col span={4}>
                  <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                    {field.label}:
                  </label>
                </Col>
                <Col span={20}>
                  <span>{field.value}</span>
                </Col>
              </Row>
            ))}

            {/* --- Thông tin đất đai --- */}
            <Divider orientation="left">Thông tin đất đai</Divider>

            <Row style={{ marginBottom: 12 }} align="middle">
              <Col span={4}>
                <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                  Số thửa, tờ theo BĐĐC 2002:
                </label>
              </Col>
              <Col span={4}>
                <span><b>Số thửa:</b> {viewingCitizen.soThua}</span>
              </Col>
              <Col span={4}>
                <span><b>Số tờ:</b> {viewingCitizen.soTo}</span>
              </Col>
              <Col span={6}>
                <span><b>Phường:</b> {viewingCitizen.phuong}</span>
              </Col>
              <Col span={6}>
                <span><b>Quận:</b> {viewingCitizen.quan}</span>
              </Col>
            </Row>

            <Row style={{ marginBottom: 12 }} align="middle">
              <Col span={4}>
                <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                  Giá thuộc:
                </label>
              </Col>
              <Col span={20}>
                <span>{viewingCitizen.giaThuoc}</span>
              </Col>
            </Row>

            {/* --- Thông báo thu hồi đất --- */}
            <Divider orientation="left">Thông báo thu hồi đất</Divider>

            <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
              <Col span={4}>
                <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                  Thông báo thu hồi đất:
                </label>
              </Col>
              <Col span={4}>
                <span><b>Số:</b> {viewingCitizen?.thongBaoThuHoiDat?.so}</span>
              </Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.thongBaoThuHoiDat?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.thongBaoThuHoiDat?.dinhKem && (
                  <a
                    href={viewingCitizen.thongBaoThuHoiDat.dinhKem}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#1890ff', textDecoration: 'none' }}
                  >
                    📎 Xem file
                  </a>
                )}
              </Col>
            </Row>

            {/* --- Quyết định phê duyệt --- */}
            <Divider orientation="left">Quyết định phê duyệt</Divider>

            <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
              <Col span={4}>
                <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                  Quyết định phê duyệt:
                </label>
              </Col>
              <Col span={4}>
                <span><b>Số:</b> {viewingCitizen?.quyetDinhPheDuyet?.so}</span>
              </Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.quyetDinhPheDuyet?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.quyetDinhPheDuyet?.dinhKem && (
                  <a
                    href={viewingCitizen.quyetDinhPheDuyet.dinhKem}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#1890ff', textDecoration: 'none' }}
                  >
                    📎 Xem file
                  </a>
                )}
              </Col>
            </Row>

            {/* --- Phương án BT, HT, TĐC --- */}
            <Divider orientation="left">Phương án BT, HT, TĐC</Divider>

            <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
              <Col span={4}>
                <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                  Phương án BT, HT, TĐC:
                </label>
              </Col>
              <Col span={4}>
                <span><b>Số:</b> {viewingCitizen?.phuongAnBTHTTDC?.so}</span>
              </Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.phuongAnBTHTTDC?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.phuongAnBTHTTDC?.dinhKem && (
                  <a
                    href={viewingCitizen.phuongAnBTHTTDC.dinhKem}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#1890ff', textDecoration: 'none' }}
                  >
                    📎 Xem file
                  </a>
                )}
              </Col>
            </Row>

            {/* --- Thông tin bổ sung --- */}
            {(viewingCitizen.tongTien || viewingCitizen.tongTienBangChu) && (
              <>
                <Divider orientation="left">Thông tin bồi thường</Divider>
                <Row style={{ marginBottom: 12 }} align="middle">
                  <Col span={4}>
                    <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                      Tổng số tiền:
                    </label>
                  </Col>
                  <Col span={10}>
                    <span>{viewingCitizen.tongTien ?
                      `${viewingCitizen.tongTien}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đồng"
                      : ""}</span>
                  </Col>
                  <Col span={10}>
                    <span><b>Bằng chữ:</b> {viewingCitizen.tongTienBangChu}</span>
                  </Col>
                </Row>
              </>
            )}

            {/* --- Trạng thái thực hiện --- */}
            <Divider orientation="left">Trạng thái thực hiện</Divider>

            {[
              {
                label: "Đã nhận tiền bồi thường, hỗ trợ",
                data: viewingCitizen?.nhanTienBoiThuongHoTro
              },
              {
                label: "Đã bàn giao mặt bằng",
                data: viewingCitizen?.banGiaoMatBang
              }
            ].map((status, index) => (
              <Row key={index} gutter={16} align="middle" style={{ marginBottom: 12 }}>
                <Col span={4}>
                  <label style={{ fontWeight: 500, display: 'inline-block', minWidth: '100%' }}>
                    {status.label}:
                  </label>
                </Col>
                <Col span={2}>
                  <span style={{
                    color: status.data?.xacNhan ? '#52c41a' : '#ff4d4f',
                    fontWeight: 500
                  }}>
                    {status.data?.xacNhan ? '✓ Đã thực hiện' : '✗ Chưa thực hiện'}
                  </span>
                </Col>
                <Col span={8}>
                  {status.data?.ngay && (
                    <span><b>Ngày:</b> {status.data.ngay}</span>
                  )}
                </Col>
                <Col span={10}>
                  {status.data?.dinhKem && (
                    <a
                      href={status.data.dinhKem}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#1890ff', textDecoration: 'none' }}
                    >
                      📎 Xem file
                    </a>
                  )}
                </Col>
              </Row>
            ))}
          </div>
        )}
      </Modal>

    </div >
  );
}
