import { useState, useEffect } from "react";
import {
  Table,
  Input,
  message,
  Spin,
  Avatar,
  Tooltip,
  Button,
  Modal,
  Form,
  Select,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  PageHeader,
  FilterContainer,
  HeaderActions,
  CenteredAction,
} from "./style";
import * as UserService from "../../../services/UserService";

const { Option } = Select;

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [adding, setAdding] = useState(false); // loading khi thêm
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user"));

  // Lấy danh sách nhân viên
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await UserService.getAllUser(user?.access_token);
        const employeeList = res?.map((emp, index) => ({
          key: emp.id || index.toString(),
          name: emp.name || emp.email.split("@")[0],
          email: emp.email,
          role: emp.roles?.join(", ") || "employee",
          avatar: emp.avatar || "",
        })) || [];
        setEmployees(employeeList);
        setFilteredEmployees(employeeList);
      } catch (err) {
        message.error("Không thể tải danh sách nhân viên");
      }
      setLoading(false);
    };
    fetchEmployees();
  }, [user?.access_token]);

  // Xóa nhân viên
  const handleDelete = (record) => {
    setCurrentEmployee(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentEmployee?.key) {
      message.error("UID nhân viên không hợp lệ!");
      setIsDeleteModalVisible(false);
      return;
    }
    try {
      await UserService.deleteUser(currentEmployee.key, user?.access_token);
      message.success(`Đã xóa nhân viên: ${currentEmployee.name}`);
      setEmployees(prev => prev.filter(emp => emp.key !== currentEmployee.key));
      setFilteredEmployees(prev => prev.filter(emp => emp.key !== currentEmployee.key));
      setIsDeleteModalVisible(false);
    } catch (err) {
      console.log(err);
      message.error(err?.message || "Xóa nhân viên thất bại!");
    }
  };

  const handleAddEmployee = async () => {
    try {
      const values = await form.validateFields();
      setAdding(true);
      const newEmp = await UserService.createUser(values, user?.access_token);
      const newEmployee = {
        key: newEmp.id || newEmp._id,
        name: newEmp.name,
        email: newEmp.email,
        role: Array.isArray(newEmp.roles) ? newEmp.roles.join(", ") : newEmp.roles || "employee",
        avatar: newEmp.avatar || "",
      };

      setEmployees(prev => [...prev, newEmployee]);

      setFilteredEmployees(prev => {
        const keyword = searchName.toLowerCase();
        if (!keyword) return [...prev, newEmployee];
        if (
          newEmployee.name.toLowerCase().includes(keyword) ||
          newEmployee.email.toLowerCase().includes(keyword)
        ) {
          return [...prev, newEmployee];
        }
        return prev;
      });

      message.success("Thêm nhân viên thành công!");
      form.resetFields();
      setIsAddModalVisible(false);

    } catch (err) {
      console.log(err);
      message.error(err?.message || "Thêm nhân viên thất bại!");
    } finally {
      setAdding(false);
    }
  };


  // Tìm kiếm nhân viên
  useEffect(() => {
    const keyword = searchName.toLowerCase();
    const results = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(keyword) ||
        emp.email?.toLowerCase().includes(keyword)
    );
    setFilteredEmployees(results);
  }, [searchName, employees]);

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (text) => (
        <Avatar src={text} size={48} style={{ backgroundColor: "#87d068" }}>
          {!text && "NV"}
        </Avatar>
      ),
    },
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <CenteredAction>
          <Tooltip title="Xóa nhân viên">
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
        <h2>Quản lý nhân viên</h2>

      </PageHeader>

      <FilterContainer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Input
          placeholder="Tìm nhân viên theo tên hoặc email"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 250, height: 40 }}
        />

        <HeaderActions>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddModalVisible(true);
              form.resetFields();
            }}
          >
            Thêm nhân viên
          </Button>
        </HeaderActions>
      </FilterContainer>


      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredEmployees}
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
        <p>Bạn có chắc chắn muốn xóa nhân viên {currentEmployee?.name}?</p>
      </Modal>

      {/* Modal thêm */}
      <Modal
        title="Thêm nhân viên"
        open={isAddModalVisible}
        onOk={handleAddEmployee}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={adding}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên nhân viên"
            name="name"
            rules={[{ required: true, message: "Nhập tên nhân viên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="roles"
            rules={[{ required: true, message: "Chọn role!" }]}
          >
            <Select mode="multiple" placeholder="Chọn role">
              <Option value="employee">Employee</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Nhập email hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
