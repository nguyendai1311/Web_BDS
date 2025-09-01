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
  Col,
  Row,
  Divider,
  Upload,
  Select,
  InputNumber,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined, EyeOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";

import * as ProjectService from "../../../services/ProjectService";
import * as HouseholdService from "../../../services/CitizenService";
import * as EmployeeService from "../../../services/UserService";
import { uploadFile } from "../../../services/FileService"
import {
  setSelectedHouseholds,
  setSelectedEmployees,
  clearHouseholds,
  clearEmployees
} from "../../../redux/slices/projectSlice";

import { PageHeader, FilterContainer, HeaderActions, CenteredAction } from "./style";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const [households, setHouseholds] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Lấy dữ liệu từ Redux
  const dispatch = useDispatch();
  const selectedHouseholds = useSelector(state => state.project?.selectedHouseholds || []);
  const selectedEmployees = useSelector(state => state.project?.selectedEmployees || []);

  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();

  // ================== Fetch projects ==================
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await ProjectService.getAllProjects(user?.access_token);

      const list =
        res?.map((proj, index) => ({
          key: proj.id || index.toString(),
          id: proj.id,
          project_code: proj.project_code || "",
          name: proj.project_name || proj.name || "",
          investor: proj.investor || "",
          approval_decision_no: proj.approval_decision_no || "",
          approval_date: proj.approval_date
            ? dayjs(proj.approval_date).format("YYYY-MM-DD")
            : "",
          approval_decision_file: proj.approval_decision_file || "",
          map_no: proj.map_no || "",
          map_approval_date: proj.map_approval_date
            ? dayjs(proj.map_approval_date).format("YYYY-MM-DD")
            : "",
          map_file: proj.map_file || "",
          land_price_decision_no: proj.land_price_decision_no || "",
          land_price_approval_date: proj.land_price_approval_date
            ? dayjs(proj.land_price_approval_date).format("YYYY-MM-DD")
            : "",
          land_price_file: proj.land_price_file || "",
          compensation_plan_decision_no: proj.compensation_plan_decision_no || "",
          compensation_plan_approval_date: proj.compensation_plan_approval_date
            ? dayjs(proj.compensation_plan_approval_date).format("YYYY-MM-DD")
            : "",
          compensation_plan_file: proj.compensation_plan_file || "",
          compensation_plan_no: proj.compensation_plan_no || "",
          plan_approval_date: proj.plan_approval_date
            ? dayjs(proj.plan_approval_date).format("YYYY-MM-DD")
            : "",
          plan_file: proj.plan_file || "",
          site_clearance_start_date: proj.site_clearance_start_date
            ? dayjs(proj.site_clearance_start_date).format("YYYY-MM-DD")
            : "",
          project_status: proj.project_status || "",
          project_objectives: proj.project_objectives || "",
          project_scale: proj.project_scale || "",
          project_location:proj.project_location || "",
          construction_cost: proj.construction_cost || 0,
          project_management_cost: proj.project_management_cost || 0,
          consulting_cost: proj.consulting_cost || 0,
          other_costs: proj.other_costs || 0,
          contingency_cost: proj.contingency_cost || 0,
          land_clearance_cost: proj.land_clearance_cost || 0,
          start_point: proj.start_point || "",
          end_point: proj.end_point || "",
          total_length: proj.total_length || 0,
          funding_source: proj.funding_source || "",
          resettlement_plan: proj.resettlement_plan || "",
          other_documents: proj.other_documents || "",
          households: proj.households || [],
          employees: proj.employees || [],
          createdAt: proj.createdAt?._seconds
            ? dayjs.unix(proj.createdAt._seconds).format("YYYY-MM-DD HH:mm:ss")
            : "",
          updatedAt: proj.updatedAt?._seconds
            ? dayjs.unix(proj.updatedAt._seconds).format("YYYY-MM-DD HH:mm:ss")
            : "",
        })) || [];

      setProjects(list);
      setFilteredProjects(list);
    } catch (err) {
      message.error("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  // ================== Check và mở lại modal khi quay về ==================
  useEffect(() => {
    const reopenData = localStorage.getItem("reopenModal");
    if (!reopenData || projects.length === 0) return;

    try {
      const { type, projectId, restoreData } = JSON.parse(reopenData);

      // clear ngay sau khi đọc
      localStorage.removeItem("reopenModal");

      setTimeout(async () => {
        if (type === "view" && projectId) {
          const proj = projects.find(p => p.id === projectId || p.key === projectId);
          if (proj) {
            setViewProject(proj);
            setIsViewModalVisible(true);
          }
        }
        else if (type === "edit" && projectId) {
          const proj = projects.find(p => p.id === projectId || p.key === projectId);
          if (proj) {
            await openModal(proj);
          }
        }
        else if (type === "add" && projectId === "new") {
          await openModal(null);

          // Restore dữ liệu form nếu có
          if (restoreData?.formValues) {
            form.setFieldsValue(restoreData.formValues);
          }

          // Households và employees đã được lưu trong Redux, không cần restore thêm
        }
      }, 100);
    } catch (err) {
      console.error("Error parsing reopenModal data:", err);
      localStorage.removeItem("reopenModal");
    }
  }, [location, projects]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================== Fetch households / employees ==================
  const fetchHouseholds = async () => {
    try {
      const res = await HouseholdService.getAll(user?.access_token);
      const list = res?.map((h, i) => ({
        key: h.id || i.toString(),
        id: h.id,
        maHoDan: h.maHoDan,
        ownerName: h.hoTenChuSuDung || h.ownerName,
        address: h.diaChiThuongTru || h.address,
      })) || [];
      setHouseholds(list);
      return list;
    } catch {
      message.error("Không thể tải danh sách hộ dân!");
      return [];
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await EmployeeService.getAllUser(user?.access_token);
      const list = res?.filter(e => e.roles?.includes("employee")).map((e, i) => ({
        key: e.id || i.toString(),
        id: e.id,
        name: e.email,
        position: e.roles?.join(", ") || "employee",
      })) || [];
      setEmployees(list);
      return list;
    } catch {
      message.error("Không thể tải danh sách nhân viên!");
      return [];
    }
  };

  // ================== Open modal ==================
  const openModal = async (project = null) => {
    form.resetFields();
    setEditingProject(project);

    if (!project) {
      // 👉 Chỉ clear khi tạo mới
      dispatch(clearHouseholds());
      dispatch(clearEmployees());
    }

    await fetchHouseholds();
    await fetchEmployees();

    if (project) {
      const formValues = {
        project_code: project.project_code,
        project_name: project.name,
        investor: project.investor,
        approval_decision_no: project.approval_decision_no,
        approval_date: project.approval_date ? dayjs(project.approval_date) : null,
        map_no: project.map_no,
        map_approval_date: project.map_approval_date ? dayjs(project.map_approval_date) : null,
        land_price_decision_no: project.land_price_decision_no,
        land_price_approval_date: project.land_price_approval_date ? dayjs(project.land_price_approval_date) : null,
        compensation_plan_decision_no: project.compensation_plan_decision_no,
        compensation_plan_approval_date: project.compensation_plan_approval_date ? dayjs(project.compensation_plan_approval_date) : null,
        compensation_plan_no: project.compensation_plan_no,
        plan_approval_date: project.plan_approval_date ? dayjs(project.plan_approval_date) : null,
        site_clearance_start_date: project.site_clearance_start_date ? dayjs(project.site_clearance_start_date) : null,
        project_status: project.project_status,
        project_objectives: project.project_objectives,
        project_scale: project.project_scale,
        project_location:project.project_location,
        construction_cost: project.construction_cost,
        project_management_cost: project.project_management_cost,
        consulting_cost: project.consulting_cost,
        other_costs: project.other_costs,
        contingency_cost: project.contingency_cost,
        land_clearance_cost: project.land_clearance_cost,
        start_point: project.start_point,
        end_point: project.end_point,
        total_length: project.total_length,
        funding_source: project.funding_source,
        resettlement_plan: project.resettlement_plan,
        other_documents: project.other_documents,
      };

      form.setFieldsValue(formValues);

      try {
        const hh = await Promise.all(
          project.households.map(h =>
            HouseholdService.getById(h.id, user?.access_token)
              .then(r => r.data || r)
              .catch(() => null)
          )
        );
        const emp = await Promise.all(
          project.employees.map(e =>
            EmployeeService.getDetailsUser(e.id, user?.access_token)
              .then(r => r.data || r)
              .catch(() => null)
          )
        );

        dispatch(setSelectedHouseholds(hh.filter(Boolean)));
        dispatch(setSelectedEmployees(emp.filter(Boolean)));
      } catch (error) {
        console.error("Error loading households/employees:", error);
      }
    }

    setIsModalVisible(true);
  };


  // ================== Lưu dữ liệu tạm khi chuyển trang ==================
  const saveTemporaryData = () => {
    const formValues = form.getFieldsValue();
    const tempData = {
      formValues,
      selectedHouseholds, // Từ Redux
      selectedEmployees, // Từ Redux
      timestamp: Date.now()
    };
    localStorage.setItem("tempProjectData", JSON.stringify(tempData));
  };

  // ================== Add / Update ==================
  // ================== Add / Update ==================
  const handleSubmit = async (values) => {
    try {

      setUpdating(true);

      // Validate required fields
      if (!values.project_code || !values.project_name) {
        message.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
      }

      // Tạo FormData để gửi files
      const formData = new FormData();

      // Thêm các trường text vào FormData
      formData.append('project_code', values.project_code);
      formData.append('project_name', values.project_name);
      formData.append('investor', values.investor || "");
      formData.append('approval_decision_no', values.approval_decision_no || "");
      formData.append('approval_date', values.approval_date ? values.approval_date.format("YYYY-MM-DD") : "");
      formData.append('map_no', values.map_no || "");
      formData.append('map_approval_date', values.map_approval_date ? values.map_approval_date.format("YYYY-MM-DD") : "");
      formData.append('land_price_decision_no', values.land_price_decision_no || "");
      formData.append('land_price_approval_date', values.land_price_approval_date ? values.land_price_approval_date.format("YYYY-MM-DD") : "");
      formData.append('compensation_plan_decision_no', values.compensation_plan_decision_no || "");
      formData.append('compensation_plan_approval_date', values.compensation_plan_approval_date ? values.compensation_plan_approval_date.format("YYYY-MM-DD") : "");
      formData.append('compensation_plan_no', values.compensation_plan_no || "");
      formData.append('plan_approval_date', values.plan_approval_date ? values.plan_approval_date.format("YYYY-MM-DD") : "");
      formData.append('site_clearance_start_date', values.site_clearance_start_date ? values.site_clearance_start_date.format("YYYY-MM-DD") : "");
      formData.append('project_status', values.project_status || "");
      formData.append('project_objectives', values.project_objectives || "");
      formData.append('project_scale', values.project_scale || "");
      formData.append('project_location', values.project_location || "");
      formData.append('construction_cost', values.construction_cost || 0);
      formData.append('project_management_cost', values.project_management_cost || 0);
      formData.append('consulting_cost', values.consulting_cost || 0);
      formData.append('other_costs', values.other_costs || 0);
      formData.append('contingency_cost', values.contingency_cost || 0);
      formData.append('land_clearance_cost', values.land_clearance_cost || 0);
      formData.append('start_point', values.start_point || "");
      formData.append('end_point', values.end_point || "");
      formData.append('total_length', values.total_length || 0);
      formData.append('funding_source', values.funding_source || "");
      formData.append('resettlement_plan', values.resettlement_plan || "");
      formData.append('other_documents', values.other_documents || "");

      // Thêm households và employees từ Redux
      formData.append("households", JSON.stringify(selectedHouseholds.map(h => h.id).filter(Boolean)));
      formData.append("employees", JSON.stringify(selectedEmployees.map(e => e.id).filter(Boolean)));

      // Xử lý files - chỉ thêm files mới (chưa upload)
      const fileFields = [
        'approval_decision_file',
        'map_file',
        'land_price_file',
        'compensation_plan_file',
        'plan_file',
        'other_files'
      ];

      fileFields.forEach(fieldName => {
        const fileList = values[fieldName];
        if (fileList && Array.isArray(fileList)) {
          fileList.forEach(file => {
            // Chỉ thêm file mới (có originFileObj)
            if (file.originFileObj) {
              // Sử dụng fieldName phù hợp với backend
              let backendFieldName = fieldName;
              if (fieldName === 'other_files') {
                backendFieldName = 'other_documents'; // Backend expect other_documents
              }
              formData.append(backendFieldName, file.originFileObj);
            }
          });
        }
      });

      console.log(">>> FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }

      let result;
      if (editingProject) {
        result = await ProjectService.updateProject(editingProject.key, formData, user?.access_token);
        message.success("Cập nhật dự án thành công!");
      } else {
        result = await ProjectService.createProject(formData, user?.access_token);
        message.success("Thêm dự án thành công!");
      }

      console.log(">>> API response:", result);

      // Cập nhật state local với dữ liệu từ Redux
      const savedProject = result.data || result;

      // Parse households và employees nếu chúng là string
      let parsedHouseholds = [];
      let parsedEmployees = [];

      try {
        parsedHouseholds = typeof savedProject.households === 'string'
          ? JSON.parse(savedProject.households)
          : (Array.isArray(savedProject.households) ? savedProject.households : []);
      } catch (e) {
        parsedHouseholds = selectedHouseholds.map(h => ({ id: h.id }));
      }

      try {
        parsedEmployees = typeof savedProject.employees === 'string'
          ? JSON.parse(savedProject.employees)
          : (Array.isArray(savedProject.employees) ? savedProject.employees : []);
      } catch (e) {
        parsedEmployees = selectedEmployees.map(e => ({ id: e.id }));
      }

      const projectItem = {
        key: savedProject.id,
        id: savedProject.id,
        project_code: savedProject.project_code,
        name: savedProject.project_name,
        investor: savedProject.investor,
        approval_decision_no: savedProject.approval_decision_no,
        approval_date: savedProject.approval_date,
        approval_decision_file: savedProject.approval_decision_file,
        map_no: savedProject.map_no,
        map_approval_date: savedProject.map_approval_date,
        map_file: savedProject.map_file,
        land_price_decision_no: savedProject.land_price_decision_no,
        land_price_approval_date: savedProject.land_price_approval_date,
        land_price_file: savedProject.land_price_file,
        compensation_plan_decision_no: savedProject.compensation_plan_decision_no,
        compensation_plan_approval_date: savedProject.compensation_plan_approval_date,
        compensation_plan_file: savedProject.compensation_plan_file,
        compensation_plan_no: savedProject.compensation_plan_no,
        plan_approval_date: savedProject.plan_approval_date,
        plan_file: savedProject.plan_file,
        site_clearance_start_date: savedProject.site_clearance_start_date,
        project_status: savedProject.project_status,
        project_objectives: savedProject.project_objectives,
        project_scale: savedProject.project_scale,
        project_location:savedProject.project_location,
        construction_cost: savedProject.construction_cost,
        project_management_cost: savedProject.project_management_cost,
        consulting_cost: savedProject.consulting_cost,
        other_costs: savedProject.other_costs,
        contingency_cost: savedProject.contingency_cost,
        land_clearance_cost: savedProject.land_clearance_cost,
        start_point: savedProject.start_point,
        end_point: savedProject.end_point,
        total_length: savedProject.total_length,
        funding_source: savedProject.funding_source,
        resettlement_plan: savedProject.resettlement_plan,
        other_documents: savedProject.other_documents,
        // Sử dụng dữ liệu đã parse
        households: parsedHouseholds,
        employees: parsedEmployees,
        createdAt: savedProject.createdAt,
        updatedAt: savedProject.updatedAt,
      };

      // Cập nhật state
      if (editingProject) {
        setProjects((prev) =>
          prev.map((p) => (p.key === projectItem.key ? projectItem : p))
        );
        setFilteredProjects((prev) =>
          prev.map((p) => (p.key === projectItem.key ? projectItem : p))
        );
      } else {
        setProjects((prev) => [...prev, projectItem]);
        setFilteredProjects((prev) => [...prev, projectItem]);
      }

      // Xóa dữ liệu tạm và clear Redux
      localStorage.removeItem("tempProjectData");
      localStorage.removeItem("selectedHouseholdsForNewProject");
      dispatch(clearHouseholds());
      dispatch(clearEmployees());

      // Close modal and reset
      form.resetFields();
      setEditingProject(null);
      setIsModalVisible(false);

    } catch (err) {
      console.error(">>> API Error:", err);
      message.error(err?.message || err?.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setUpdating(false);
    }
  };


  // ================== Delete ==================
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const handleDelete = (proj) => {
    setCurrentProject(proj);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await ProjectService.deleteProject(currentProject.key, user?.access_token);
      setProjects(prev => prev.filter(p => p.key !== currentProject.key));
      setFilteredProjects(prev => prev.filter(p => p.key !== currentProject.key));
      message.success("Xóa dự án thành công!");
      setIsDeleteModalVisible(false);
    } catch {
      message.error("Xóa thất bại!");
    }
  };

  // ================== Columns ==================
  const columns = [
    { title: "Mã dự án", dataIndex: "project_code", key: "project_code" },
    { title: "Tên dự án", dataIndex: "name", key: "name" },
    { title: "Chủ đầu tư", dataIndex: "investor", key: "investor" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <CenteredAction>
          <Tooltip title="Xem chi tiết">
            <Button type="link" icon={<EyeOutlined />} onClick={() => { setViewProject(record); setIsViewModalVisible(true); }} />
          </Tooltip>
          <Tooltip title="Sửa dự án">
            <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa dự án">
            <Button type="link" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
          </Tooltip>
        </CenteredAction>
      ),
    },
  ];

  // ================== Search ==================
  // useEffect(() => {
  //   const keyword = searchKeyword.toLowerCase();
  //   setFilteredProjects(projects.filter(p =>
  //     p.name.toLowerCase().includes(keyword) ||
  //     p.project_code.toLowerCase().includes(keyword)
  //   ));
  // }, [searchKeyword, projects]);

  return (
    <div style={{ padding: 24 }}>
      <PageHeader><h2>Quản lý dự án</h2></PageHeader>

      <FilterContainer>
        <Input
          placeholder="Tìm dự án..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          style={{ width: 300 }}
        />
        <HeaderActions>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
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

      {/* Modal xem */}
      <Modal
        title="Chi tiết dự án"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {viewProject && (
          <div>
            <p><b>Mã dự án:</b> {viewProject.project_code}</p>
            <p><b>Tên dự án:</b> {viewProject.name}</p>
            <p><b>Chủ đầu tư:</b> {viewProject.investor}</p>
            <p>
              <b>Hộ dân:</b>{" "}
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  setIsViewModalVisible(false);
                  localStorage.setItem("reopenModal", JSON.stringify({ type: "view", projectId: viewProject?.id }));
                  navigate(`/system/admin/households/${viewProject?.id}/view`);
                }}
              >
                Xem
              </Button>
            </p>
            <p>
              <b>Nhân viên:</b>{" "}
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  setIsViewModalVisible(false);
                  localStorage.setItem("reopenModal", JSON.stringify({ type: "view", projectId: viewProject?.id }));
                  navigate(`/system/admin/employees/${viewProject.id}/view`);
                }}
              >
                Xem
              </Button>
            </p>
          </div>
        )}
      </Modal>

      {/* Modal xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa dự án {currentProject?.name}?</p>
      </Modal>

      {/* Modal thêm sửa dự án */}
      <Modal
        title={editingProject ? "Sửa dự án" : "Thêm dự án"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProject(null);
          form.resetFields();
        }}
        footer={null}
        width={1200}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleSubmit}
          onFinishFailed={(errorInfo) => {
            console.log("Form validation failed:", errorInfo);
            message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
          }}
        >
          {/* Header: Thông tin cơ bản + 2 nút */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Divider orientation="left" style={{ marginBottom: 0 }}>Thông tin cơ bản</Divider>
            </Col>
            <Col>
              <Space>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: 8, fontWeight: 500 }}>
                    Hộ dân ({selectedHouseholds.length}):
                  </span>
                  {editingProject ? (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        saveTemporaryData();
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({ type: "edit", projectId: editingProject?.id }));
                        navigate(`/system/admin/households/${editingProject?.id}/edit`);
                      }}
                    >
                      Sửa hộ dân
                    </Button>
                  ) : (
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        saveTemporaryData();
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({
                          type: "add",
                          projectId: "new",
                          restoreData: {
                            formValues: form.getFieldsValue(),
                            selectedHouseholds,
                            selectedEmployees
                          }
                        }));
                        navigate(`/system/admin/households/new/add`);
                      }}
                    >
                      Thêm hộ dân
                    </Button>
                  )}
                </div>

                <Button type="default" onClick={() => navigate("/duong-dan-trang-2")}>
                  Đơn giá đất
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Hiển thị danh sách hộ dân đã chọn */}
          {selectedHouseholds.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={4}><label>Hộ dân đã chọn:</label></Col>
              <Col span={20}>
                <div style={{ maxHeight: 100, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}>
                  {selectedHouseholds.map((household, index) => (
                    <div key={household.id || index} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{household.maHoDan}</span> - {household.hoTenChuSuDung || household.ownerName}
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          )}

          {/* Thông tin cơ bản */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Mã dự án:</label></Col>
            <Col span={6}>
              <Form.Item
                name="project_code"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Vui lòng nhập mã dự án!" }]}
              >
                <Input placeholder="Nhập mã dự án" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Tên dự án:</label></Col>
            <Col span={6}>
              <Form.Item
                name="project_name"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "Vui lòng nhập tên dự án!" }]}
              >
                <Input placeholder="Nhập tên dự án" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Chủ đầu tư:</label></Col>
            <Col span={6}>
              <Form.Item name="investor" style={{ marginBottom: 0 }}>
                <Input placeholder="Nhập tên chủ đầu tư" />
              </Form.Item>
            </Col>
          </Row>

          {/* Phê duyệt dự án */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quyết định phê duyệt dự án:</label></Col>
            <Col span={4}>
              <Form.Item name="approval_decision_no" style={{ marginBottom: 0 }}>
                <Input placeholder="Số quyết định" />
              </Form.Item>
            </Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}>
              <Form.Item name="approval_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}>
              <Form.Item
                name="approval_decision_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Bản đồ hiện trạng */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Bản đồ hiện trạng vị trí đã được sở duyệt:</label></Col>
            <Col span={4}>
              <Form.Item name="map_no" style={{ marginBottom: 0 }}>
                <Input placeholder="Số bản đồ" />
              </Form.Item>
            </Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}>
              <Form.Item name="map_approval_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}>
              <Form.Item
                name="map_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Quyết định phê duyệt giá đất */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quyết định phê duyệt giá đất:</label></Col>
            <Col span={4}>
              <Form.Item name="land_price_decision_no" style={{ marginBottom: 0 }}>
                <Input placeholder="Số quyết định" />
              </Form.Item>
            </Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}>
              <Form.Item name="land_price_approval_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}>
              <Form.Item
                name="land_price_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Phương án BT, HT, TĐC */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Phương án BT, HT, TĐC:</label></Col>
            <Col span={4}>
              <Form.Item name="compensation_plan_no" style={{ marginBottom: 0 }}>
                <Input placeholder="Số quyết định" />
              </Form.Item>
            </Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}>
              <Form.Item name="plan_approval_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}>
              <Form.Item
                name="plan_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Quyết định phê duyệt phương án BT, HT, TĐC */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quyết định phê duyệt phương án BT, HT, TĐC:</label></Col>
            <Col span={4}>
              <Form.Item name="compensation_plan_decision_no" style={{ marginBottom: 0 }}>
                <Input placeholder="Số quyết định" />
              </Form.Item>
            </Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}>
              <Form.Item name="compensation_plan_approval_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}>
              <Form.Item
                name="compensation_plan_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Thời gian thực hiện, trạng thái */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}>
              <label style={{ display: "block", lineHeight: "32px" }}>Ngày bắt đầu BTGPMB:</label>
            </Col>
            <Col span={6}>
              <Form.Item name="site_clearance_start_date" style={{ marginBottom: 0 }}>
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>

            <Col span={3}>
              <label style={{ display: "block", lineHeight: "32px" }}>Trạng thái dự án:</label>
            </Col>
            <Col span={4}>
              <Form.Item name="project_status" style={{ marginBottom: 0 }}>
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="planned">Planned</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="on_hold">On Hold</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Mục tiêu, Quy mô, Địa điểm */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Mục tiêu dự án:</label></Col>
            <Col span={20}>
              <Form.Item name="project_objectives" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={1} placeholder="Nhập mục tiêu dự án" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quy mô dự án:</label></Col>
            <Col span={20}>
              <Form.Item name="project_scale" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={1} placeholder="Nhập quy mô dự án" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Địa điểm dự án:</label></Col>
            <Col span={20}>
              <Form.Item name="project_location" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={1} placeholder="Nhập địa điểm dự án" />
              </Form.Item>
            </Col>
          </Row>

          {/* Nguồn vốn & kế hoạch bố trí */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Nguồn vốn dự án:</label></Col>
            <Col span={20}>
              <Form.Item name="funding_source" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={1} placeholder="Nhập nguồn vốn dự án" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Kế hoạch bố trí TĐC:</label></Col>
            <Col span={20}>
              <Form.Item name="resettlement_plan" style={{ marginBottom: 0 }}>
                <Input.TextArea rows={1} placeholder="Nhập kế hoạch bố trí TĐC" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Văn bản đính kèm khác:</label></Col>
            <Col span={20}>
              <Form.Item
                name="other_files"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
                style={{ marginBottom: 0 }}
              >
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  maxCount={10}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Nhân viên */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6} style={{ textAlign: "right", fontWeight: 500 }}>
              Nhân viên ({selectedEmployees.length}):
            </Col>
            <Col span={18}>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  saveTemporaryData();
                  setIsModalVisible(false);
                  localStorage.setItem("reopenModal", JSON.stringify({ type: "edit", projectId: editingProject?.id }));
                  navigate(`/system/admin/employees/${editingProject?.id}/edit`);
                }}
                disabled={!editingProject?.id}
              >
                Xem
              </Button>
            </Col>
          </Row>

          {/* Hiển thị danh sách nhân viên đã chọn */}
          {selectedEmployees.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={4}><label>Nhân viên đã chọn:</label></Col>
              <Col span={20}>
                <div style={{ maxHeight: 100, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}>
                  {selectedEmployees.map((employee, index) => (
                    <div key={employee.id || index} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{employee.name || employee.email}</span> - {employee.position}
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          )}

          {/* Buttons */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={24} style={{ textAlign: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingProject(null);
                  dispatch(clearHouseholds());
                  dispatch(clearEmployees());
                  form.resetFields();
                }}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                loading={updating}
                htmlType="submit"
              >
                Lưu
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
