import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Upload,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  message,
  Tooltip,
  Spin,
  Table,
  Divider,
  Checkbox,
  InputNumber,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as CitizenService from "../../../services/CitizenService";
import { uploadFile } from "../../../services/FileService";
import {
  PageHeader,
  FilterContainer,
  HeaderActions,
  CenteredAction,
} from "./style";
import { renderFileList } from "../../../utils/fileRender";
import { parseDayjsToDate, toDayjsOrNull, normalizeDate } from "../../../utils/date";


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
  const [viewForm] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    const fetchCitizens = async () => {
      setLoading(true);
      try {
        const res = await CitizenService.getAll(user?.access_token);
        const data = res?.data || [];

        const list = data.map((cit, index) => ({
          key: cit.id || index.toString(),
          maHoDan: cit.maHoDan || "",
          hoTenChuSuDung: cit.hoTenChuSuDung || "",
          soDienThoaiLienLac: cit.soDienThoaiLienLac || "",
          diaChiThuongTru: cit.diaChiThuongTru || "",
          diaChiGiaiToa: cit.diaChiGiaiToa || "",
          soThua: cit.soThua || "",
          soTo: cit.soTo || "",
          phuong: cit.phuong || "",
          quan: cit.quan || "",
          giaThuoc: cit.giaThuoc || "",
          thongBaoThuHoiDat: cit.thongBaoThuHoiDat
            ? {
              ...cit.thongBaoThuHoiDat,
              ngay: normalizeDate(cit.thongBaoThuHoiDat.ngay),
            }
            : null,
          quyetDinhPheDuyet: cit.quyetDinhPheDuyet
            ? {
              ...cit.quyetDinhPheDuyet,
              ngay: normalizeDate(cit.quyetDinhPheDuyet.ngay),
            }
            : null,
          phuongAnBTHTTDC: cit.phuongAnBTHTTDC
            ? {
              ...cit.phuongAnBTHTTDC,
              ngay: normalizeDate(cit.phuongAnBTHTTDC.ngay),
            }
            : null,
          nhanTienBoiThuongHoTro: cit.daNhanTienBoiThuong
            ? {
              ...cit.daNhanTienBoiThuong,
              ngay: normalizeDate(cit.daNhanTienBoiThuong.ngay),
            }
            : { xacNhan: false, ngay: null, dinhKem: [] },
          banGiaoMatBang: cit.daBanGiaoMatBang
            ? {
              ...cit.daBanGiaoMatBang,
              ngay: normalizeDate(cit.daBanGiaoMatBang.ngay),
            }
            : { xacNhan: false, ngay: null, dinhKem: [] },
          tongTien: cit.tongSoTienBoiThuongHoTro || "",
          tongTienBangChu: cit.bangChu || "",
          createdAt: normalizeDate(cit.createdAt),
          updatedAt: normalizeDate(cit.updatedAt),
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

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const results = citizens.filter(
      (c) =>
        c.hoTenChuSuDung?.toLowerCase().includes(keyword) ||
        c.maHoDan?.toLowerCase().includes(keyword) ||
        c.soDienThoaiLienLac?.toLowerCase().includes(keyword)
    );
    setFilteredCitizens(results);
  }, [searchKeyword, citizens]);

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
      message.success(`Đã xóa dân cư: ${editingCitizen.hoTenChuSuDung}`);
      setCitizens((prev) => prev.filter((c) => c.key !== editingCitizen.key));
      setFilteredCitizens((prev) =>
        prev.filter((c) => c.key !== editingCitizen.key)
      );
      setIsDeleteModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Xóa thất bại!");
    }
  };

  const handleAddEditCitizen = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const processFiles = async (fileList, fieldName) => {
        if (!fileList) return null;
        const uploadedFiles = [];
        for (const f of fileList) {
          if (f.url) uploadedFiles.push(f.url);
          else if (f.originFileObj) {
            const formData = new FormData();
            formData.append(fieldName, f.originFileObj);
            const res = await uploadFile(formData, user?.access_token);
            if (res?.files?.[0]?.url) uploadedFiles.push(res.files[0].url);
          }
        }
        return uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles;
      };

      const normalizedValues = {
        ...values,
        thongBaoThuHoiDat: values.thongBaoThuHoiDat
          ? {
            so: values.thongBaoThuHoiDat.so || "",
            ngay: parseDayjsToDate(values.thongBaoThuHoiDat.ngay),
            dinhKem: await processFiles(
              values.thongBaoThuHoiDat.dinhKem,
              "thongBaoThuHoiDat"
            ),
          }
          : null,

        quyetDinhPheDuyet: values.quyetDinhPheDuyet
          ? {
            so: values.quyetDinhPheDuyet.so || "",
            ngay: parseDayjsToDate(values.quyetDinhPheDuyet.ngay),
            dinhKem: await processFiles(
              values.quyetDinhPheDuyet.dinhKem,
              "quyetDinhPheDuyet"
            ),
          }
          : null,

        phuongAnBTHTTDC: values.phuongAnBTHTTDC
          ? {
            so: values.phuongAnBTHTTDC.so || "",
            ngay: parseDayjsToDate(values.phuongAnBTHTTDC.ngay),
            dinhKem: await processFiles(
              values.phuongAnBTHTTDC.dinhKem,
              "phuongAnBTHTTDC"
            ),
          }
          : null,

        nhanTienBoiThuongHoTro: values.nhanTienBoiThuongHoTro
          ? {
            xacNhan: values.nhanTienBoiThuongHoTro.xacNhan || false,
            ngay: parseDayjsToDate(values.nhanTienBoiThuongHoTro.ngay),
            dinhKem: await processFiles(
              values.nhanTienBoiThuongHoTro.dinhKem,
              "nhanTienBoiThuongHoTro"
            ),
          }
          : { xacNhan: false, ngay: null, dinhKem: [] },

        banGiaoMatBang: values.banGiaoMatBang
          ? {
            xacNhan: values.banGiaoMatBang.xacNhan || false,
            ngay: parseDayjsToDate(values.banGiaoMatBang.ngay),
            dinhKem: await processFiles(
              values.banGiaoMatBang.dinhKem,
              "banGiaoMatBang"
            ),
          }
          : { xacNhan: false, ngay: null, dinhKem: [] },
      };

      let payload;
      if (editingCitizen) {
        payload = {
          ...normalizedValues,
          id: editingCitizen.key,
          updatedAt: new Date().toISOString(),
        };
      } else {
        payload = normalizedValues;
      }

      let savedCitizen;
      if (editingCitizen) {
        savedCitizen = await CitizenService.update(
          editingCitizen.key,
          payload,
          user?.access_token
        );
        message.success("Cập nhật dân cư thành công!");
      } else {
        savedCitizen = await CitizenService.create(
          payload,
          user?.access_token
        );
        message.success("Thêm dân cư thành công!");
      }

      const citizenItem = {
        key: savedCitizen.id,
        ...savedCitizen,
        thongBaoThuHoiDat: savedCitizen.thongBaoThuHoiDat
          ? {
            ...savedCitizen.thongBaoThuHoiDat,
            ngay: normalizeDate(savedCitizen.thongBaoThuHoiDat.ngay),
          }
          : null,
        quyetDinhPheDuyet: savedCitizen.quyetDinhPheDuyet
          ? {
            ...savedCitizen.quyetDinhPheDuyet,
            ngay: normalizeDate(savedCitizen.quyetDinhPheDuyet.ngay),
          }
          : null,
        phuongAnBTHTTDC: savedCitizen.phuongAnBTHTTDC
          ? {
            ...savedCitizen.phuongAnBTHTTDC,
            ngay: normalizeDate(savedCitizen.phuongAnBTHTTDC.ngay),
          }
          : null,
        nhanTienBoiThuongHoTro: savedCitizen.nhanTienBoiThuongHoTro
          ? {
            ...savedCitizen.nhanTienBoiThuongHoTro,
            ngay: normalizeDate(savedCitizen.nhanTienBoiThuongHoTro.ngay),
          }
          : { xacNhan: false, ngay: null, dinhKem: [] },
        banGiaoMatBang: savedCitizen.banGiaoMatBang
          ? {
            ...savedCitizen.banGiaoMatBang,
            ngay: normalizeDate(savedCitizen.banGiaoMatBang.ngay),
          }
          : { xacNhan: false, ngay: null, dinhKem: [] },
      };

      if (editingCitizen) {
        setCitizens((prev) =>
          prev.map((c) => (c.key === citizenItem.key ? citizenItem : c))
        );
        setFilteredCitizens((prev) =>
          prev.map((c) => (c.key === citizenItem.key ? citizenItem : c))
        );
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

  const columns = [
    { title: "Mã hộ dân", dataIndex: "maHoDan" },
    { title: "Họ tên", dataIndex: "hoTenChuSuDung" },
    { title: "SĐT", dataIndex: "soDienThoaiLienLac" },
    { title: "Địa chỉ", dataIndex: "diaChiThuongTru" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const convertFileList = (files) => {
          if (!files) return [];
          if (Array.isArray(files)) {
            return files.map((url, idx) => ({
              uid: idx,
              name: url.split("/").pop(),
              url,
              status: "done",
            }));
          } else {
            return [
              { uid: 0, name: files.split("/").pop(), url: files, status: "done" },
            ];
          }
        };

        return (
          <CenteredAction>
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await CitizenService.getById(record.key, user?.access_token);
                    console.log("c", res?.data);

                    const citizenData = res?.data;
                    if (citizenData) {
                      const citizen = {
                        key: citizenData.id,
                        ...citizenData,
                        thongBaoThuHoiDat: citizenData.thongBaoThuHoiDat
                          ? {
                            ...citizenData.thongBaoThuHoiDat,
                            ngay: normalizeDate(citizenData.thongBaoThuHoiDat.ngay),
                          }
                          : null,
                        quyetDinhPheDuyet: citizenData.quyetDinhPheDuyet
                          ? {
                            ...citizenData.quyetDinhPheDuyet,
                            ngay: normalizeDate(citizenData.quyetDinhPheDuyet.ngay),
                          }
                          : null,
                        phuongAnBTHTTDC: citizenData.phuongAnBTHTTDC
                          ? {
                            ...citizenData.phuongAnBTHTTDC,
                            ngay: normalizeDate(citizenData.phuongAnBTHTTDC.ngay),
                          }
                          : null,
                        nhanTienBoiThuongHoTro: citizenData.nhanTienBoiThuongHoTro
                          ? {
                            ...citizenData.nhanTienBoiThuongHoTro,
                            ngay: normalizeDate(citizenData.nhanTienBoiThuongHoTro.ngay),
                          }
                          : { xacNhan: false, ngay: null, dinhKem: [] },
                        banGiaoMatBang: citizenData.banGiaoMatBang
                          ? {
                            ...citizenData.banGiaoMatBang,
                            ngay: normalizeDate(citizenData.banGiaoMatBang.ngay),
                          }
                          : { xacNhan: false, ngay: null, dinhKem: [] },
                      };

                      setViewingCitizen(citizen);
                      setIsViewModalVisible(true);
                    }
                  } catch (err) {
                    console.error(err);
                    message.error("Không thể tải dữ liệu chi tiết");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </Tooltip>

            <Tooltip title="Sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await CitizenService.getById(record.key, user?.access_token);
                    const citizenData = res?.data;

                    const convertFileList = (files) => {
                      if (!files) return [];
                      if (Array.isArray(files)) {
                        return files.map((url, idx) => ({
                          uid: idx,
                          name: url.split("/").pop(),
                          url,
                          status: "done",
                        }));
                      } else {
                        return [
                          { uid: 0, name: files.split("/").pop(), url: files, status: "done" },
                        ];
                      }
                    };

                    if (citizenData) {
                      const converted = {
                        ...citizenData,
                        thongBaoThuHoiDat: citizenData.thongBaoThuHoiDat
                          ? {
                            ...citizenData.thongBaoThuHoiDat,
                            ngay: toDayjsOrNull(citizenData.thongBaoThuHoiDat.ngay),
                            dinhKem: convertFileList(citizenData.thongBaoThuHoiDat.dinhKem),
                          }
                          : null,
                        quyetDinhPheDuyet: citizenData.quyetDinhPheDuyet
                          ? {
                            ...citizenData.quyetDinhPheDuyet,
                            ngay: toDayjsOrNull(citizenData.quyetDinhPheDuyet.ngay),
                            dinhKem: convertFileList(citizenData.quyetDinhPheDuyet.dinhKem),
                          }
                          : null,
                        phuongAnBTHTTDC: citizenData.phuongAnBTHTTDC
                          ? {
                            ...citizenData.phuongAnBTHTTDC,
                            ngay: toDayjsOrNull(citizenData.phuongAnBTHTTDC.ngay),
                            dinhKem: convertFileList(citizenData.phuongAnBTHTTDC.dinhKem),
                          }
                          : null,
                        nhanTienBoiThuongHoTro: citizenData.nhanTienBoiThuongHoTro
                          ? {
                            xacNhan: citizenData.nhanTienBoiThuongHoTro.xacNhan || false,
                            ngay: toDayjsOrNull(citizenData.nhanTienBoiThuongHoTro.ngay),
                            dinhKem: convertFileList(citizenData.nhanTienBoiThuongHoTro.dinhKem),
                          }
                          : { xacNhan: false, ngay: null, dinhKem: [] },
                        banGiaoMatBang: citizenData.banGiaoMatBang
                          ? {
                            xacNhan: citizenData.banGiaoMatBang.xacNhan || false,
                            ngay: toDayjsOrNull(citizenData.banGiaoMatBang.ngay),
                            dinhKem: convertFileList(citizenData.banGiaoMatBang.dinhKem),
                          }
                          : { xacNhan: false, ngay: null, dinhKem: [] },
                        tongTien: citizenData.tongTien ? Number(citizenData.tongTien) : undefined,
                        tongTienBangChu: citizenData.tongTienBangChu || "",
                      };

                      setEditingCitizen(citizenData);
                      form.setFieldsValue(converted);
                      setIsAddEditModalVisible(true);
                    }
                  } catch (err) {
                    console.error(err);
                    message.error("Không thể tải dữ liệu để sửa");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </Tooltip>

            <Tooltip title="Xóa">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </CenteredAction>
        );
      },
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
              { label: "Mã hộ dân", value: viewingCitizen.maHoDan },
              { label: "Họ tên", value: viewingCitizen.hoTenChuSuDung },
              { label: "SĐT", value: viewingCitizen.soDienThoaiLienLac },
              { label: "Địa chỉ", value: viewingCitizen.diaChiThuongTru },
            ].map((field, index) => (
              <Row key={index} style={{ marginBottom: 12 }} align="middle">
                <Col span={4}>
                  <label style={{ fontWeight: 500 }}>{field.label}:</label>
                </Col>
                <Col span={20}>
                  <span>{field.value}</span>
                </Col>
              </Row>
            ))}

            {/* --- Thông tin đất đai --- */}
            <Divider orientation="left">Thông tin đất đai</Divider>
            <Row style={{ marginBottom: 12 }} align="middle">
              <Col span={4}><label style={{ fontWeight: 500 }}>Số thửa, tờ theo BĐĐC 2002:</label></Col>
              <Col span={4}><span><b>Số thửa:</b> {viewingCitizen.soThua}</span></Col>
              <Col span={4}><span><b>Số tờ:</b> {viewingCitizen.soTo}</span></Col>
              <Col span={6}><span><b>Phường:</b> {viewingCitizen.phuong}</span></Col>
              <Col span={6}><span><b>Quận:</b> {viewingCitizen.quan}</span></Col>
            </Row>
            <Row style={{ marginBottom: 12 }}>
              <Col span={4}><label style={{ fontWeight: 500 }}>Giá thuộc:</label></Col>
              <Col span={20}><span>{viewingCitizen.giaThuoc}</span></Col>
            </Row>

            {/* --- Thông báo thu hồi đất --- */}
            <Divider orientation="left">Thông báo thu hồi đất</Divider>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={4}><label style={{ fontWeight: 500 }}>Thông báo thu hồi đất:</label></Col>
              <Col span={4}><span><b>Số:</b> {viewingCitizen?.thongBaoThuHoiDat?.so}</span></Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.thongBaoThuHoiDat?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.thongBaoThuHoiDat?.dinhKem && (
                  <a href={viewingCitizen.thongBaoThuHoiDat.dinhKem} target="_blank" rel="noreferrer">📎 Xem file</a>
                )}
              </Col>
            </Row>

            {/* --- Quyết định phê duyệt --- */}
            <Divider orientation="left">Quyết định phê duyệt</Divider>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={4}><label style={{ fontWeight: 500 }}>Quyết định phê duyệt:</label></Col>
              <Col span={4}><span><b>Số:</b> {viewingCitizen?.quyetDinhPheDuyet?.so}</span></Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.quyetDinhPheDuyet?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.quyetDinhPheDuyet?.dinhKem && (
                  <a href={viewingCitizen.quyetDinhPheDuyet.dinhKem} target="_blank" rel="noreferrer">📎 Xem file</a>
                )}
              </Col>
            </Row>

            {/* --- Phương án BT, HT, TĐC --- */}
            <Divider orientation="left">Phương án BT, HT, TĐC</Divider>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={4}><label style={{ fontWeight: 500 }}>Phương án BT, HT, TĐC:</label></Col>
              <Col span={4}><span><b>Số:</b> {viewingCitizen?.phuongAnBTHTTDC?.so}</span></Col>
              <Col span={8}>
                <span><b>Ngày:</b> {viewingCitizen?.phuongAnBTHTTDC?.ngay}</span>
              </Col>
              <Col span={8}>
                {viewingCitizen?.phuongAnBTHTTDC?.dinhKem && (
                  <a href={viewingCitizen.phuongAnBTHTTDC.dinhKem} target="_blank" rel="noreferrer">📎 Xem file</a>
                )}
              </Col>
            </Row>

            {/* --- Thông tin bồi thường --- */}
            {(viewingCitizen.tongTien || viewingCitizen.tongTienBangChu) && (
              <>
                <Divider orientation="left">Thông tin bồi thường</Divider>
                <Row style={{ marginBottom: 12 }}>
                  <Col span={4}><label style={{ fontWeight: 500 }}>Tổng số tiền:</label></Col>
                  <Col span={10}>
                    <span>
                      {viewingCitizen.tongTien ? `${viewingCitizen.tongTien}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đồng" : ""}
                    </span>
                  </Col>
                  <Col span={10}><span><b>Bằng chữ:</b> {viewingCitizen.tongTienBangChu}</span></Col>
                </Row>
              </>
            )}

            {/* --- Trạng thái thực hiện --- */}
            <Divider orientation="left">Trạng thái thực hiện</Divider>
            {[
              { label: "Đã nhận tiền bồi thường, hỗ trợ", data: viewingCitizen?.nhanTienBoiThuongHoTro },
              { label: "Đã bàn giao mặt bằng", data: viewingCitizen?.banGiaoMatBang }
            ].map((status, index) => (
              <Row key={index} gutter={16} style={{ marginBottom: 12 }}>
                <Col span={4}><label style={{ fontWeight: 500 }}>{status.label}:</label></Col>
                <Col span={4}>
                  <span style={{ color: status.data?.xacNhan ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
                    {status.data?.xacNhan ? "✓ Đã thực hiện" : "✗ Chưa thực hiện"}
                  </span>
                </Col>
                <Col span={8}>
                  {status.data?.ngay && (
                    <span><b>Ngày:</b> {status.data.ngay}</span>
                  )}
                </Col>
                <Col span={8}>
                  {status.data?.dinhKem && (
                    <a href={status.data.dinhKem} target="_blank" rel="noreferrer">📎 Xem file</a>
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
