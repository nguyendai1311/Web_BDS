import { useState, useEffect } from "react";
import {
  Table,
  Input,
  message,
  Spin,
  Tooltip,
  Button,
  Modal,
  Form,
  DatePicker,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as ProjectService from "../../../services/ProjectService";

import {
  PageHeader,
  FilterContainer,
  HeaderActions,
  CenteredAction,
} from "./style";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user"));

  // Lấy danh sách Project
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await ProjectService.getAllProjects(user?.access_token);
        const projectList =
          res?.map((proj, index) => ({
            key: proj.id || index.toString(),
            projectNo: proj.projectNo || "",
            name: proj.nameProject || proj.name,
            date: proj.date ? dayjs(proj.date).format("YYYY-MM-DD") : "",
            investor: proj.investor || "",
          })) || [];

        setProjects(projectList);
        setFilteredProjects(projectList);
      } catch (err) {
        message.error("Không thể tải danh sách dự án");
      }
      setLoading(false);
    };
    fetchProjects();
  }, [user?.access_token]);

  // Xóa Project
  const handleDelete = (record) => {
    setCurrentProject(record);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentProject?.key) {
      message.error("ID project không hợp lệ!");
      setIsDeleteModalVisible(false);
      return;
    }
    try {
      await ProjectService.deleteProject(currentProject.key, user?.access_token);
      message.success(`Đã xóa dự án: ${currentProject.name}`);
      setProjects((prev) =>
        prev.filter((proj) => proj.key !== currentProject.key)
      );
      setFilteredProjects((prev) =>
        prev.filter((proj) => proj.key !== currentProject.key)
      );
      setIsDeleteModalVisible(false);
    } catch (err) {
      console.log(err);
      message.error(err?.message || "Xóa dự án thất bại!");
    }
  };

  // Thêm Project
  const handleAddProject = async () => {
    try {
      const values = await form.validateFields();
      setAdding(true);
      const newProj = await ProjectService.createProject(
        {
          projectNo: values.projectNo,
          nameProject: values.name,
          date: values.date.format("YYYY-MM-DD"),
          investor: values.investor,
        },
        user?.access_token
      );

      const newProject = {
        key: newProj.id || newProj._id,
        projectNo: newProj.projectNo,
        name: newProj.nameProject,
        date: dayjs(newProj.date).format("YYYY-MM-DD"),
        investor: newProj.investor,
      };

      setProjects((prev) => [...prev, newProject]);
      setFilteredProjects((prev) => [...prev, newProject]);

      message.success("Thêm dự án thành công!");
      form.resetFields();
      setIsAddModalVisible(false);
    } catch (err) {
      console.log(err);
      message.error(err?.message || "Thêm dự án thất bại!");
    } finally {
      setAdding(false);
    }
  };

  // Tìm kiếm project
  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
    const results = projects.filter(
      (proj) =>
        proj.name?.toLowerCase().includes(keyword) ||
        proj.projectNo?.toLowerCase().includes(keyword) ||
        proj.investor?.toLowerCase().includes(keyword)
    );
    setFilteredProjects(results);
  }, [searchKeyword, projects]);

  const columns = [
    { title: "Project No", dataIndex: "projectNo", key: "projectNo" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Investor", dataIndex: "investor", key: "investor" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <CenteredAction>
          <Tooltip title="Xóa dự án">
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
         <h2>Quản lý dự án </h2>
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
          placeholder="Tìm dự án theo mã, tên, hoặc chủ đầu tư"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 300, height: 40 }}
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
            Thêm dự án
          </Button>
        </HeaderActions>
      </FilterContainer>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredProjects}
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
        <p>Bạn có chắc chắn muốn xóa dự án {currentProject?.name}?</p>
      </Modal>

      {/* Modal thêm */}
      <Modal
        title="Thêm dự án"
        open={isAddModalVisible}
        onOk={handleAddProject}
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
            label="Project No"
            name="projectNo"
            rules={[{ required: true, message: "Nhập mã dự án!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên dự án"
            name="name"
            rules={[{ required: true, message: "Nhập tên dự án!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày"
            name="date"
            rules={[{ required: true, message: "Chọn ngày!" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Chủ đầu tư"
            name="investor"
            rules={[{ required: true, message: "Nhập tên chủ đầu tư!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
