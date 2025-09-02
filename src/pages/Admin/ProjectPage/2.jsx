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
import { convertFileList } from "../../../utils/convertFileList"
import {
  setSelectedHouseholds,
  setSelectedEmployees,
  clearHouseholds,
  clearEmployees,
  setSelectedLandPrices,
  clearLandPrices
} from "../../../redux/slices/projectSlice";

import { PageHeader, FilterContainer, HeaderActions, CenteredAction } from "./style";
import { useLocation, useNavigate } from "react-router-dom";
import FormUpload from "../../../components/Admin/FormUpload/FormUpload";

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
          project_location: proj.project_location || "",
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
    fetchProjects();
  }, []);

  // ================== Reopen Modal nếu có dữ liệu trong localStorage ==================
  useEffect(() => {
    if (projects.length === 0) return;

    const reopenData = localStorage.getItem("reopenModal");
    if (!reopenData) return;

    try {
      const { type, projectId, restoreData } = JSON.parse(reopenData);
      localStorage.removeItem("reopenModal");

      const proj = projects.find(p => p.id === projectId || p.key === projectId);
          
      if (type === "view" && proj) {
        setViewProject(proj);
        setIsViewModalVisible(true);
      }
      else if (type === "edit" && proj) {
        openModal(proj);
      }
      else if (type === "add" && projectId === "new") {
        openModal(null);

        // Restore dữ liệu form nếu có
        if (restoreData?.formValues) {
          const formattedValues = {
            ...restoreData.formValues,
            approval_date: restoreData.formValues.approval_date ? dayjs(restoreData.formValues.approval_date) : null,
            map_approval_date: restoreData.formValues.map_approval_date ? dayjs(restoreData.formValues.map_approval_date) : null,
            land_price_approval_date: restoreData.formValues.land_price_approval_date ? dayjs(restoreData.formValues.land_price_approval_date) : null,
            plan_approval_date: restoreData.formValues.plan_approval_date ? dayjs(restoreData.formValues.plan_approval_date) : null,
            compensation_plan_approval_date: restoreData.formValues.compensation_plan_approval_date ? dayjs(restoreData.formValues.compensation_plan_approval_date) : null,
            site_clearance_start_date: restoreData.formValues.site_clearance_start_date ? dayjs(restoreData.formValues.site_clearance_start_date) : null,
          };
          form.setFieldsValue(formattedValues);
        }

        if (restoreData?.selectedHouseholds) {
          dispatch(setSelectedHouseholds(restoreData.selectedHouseholds));
        }
        if (restoreData?.selectedEmployees) {
          dispatch(setSelectedEmployees(restoreData.selectedEmployees));
        }
        if (restoreData?.selectedLandPrices) {
          dispatch(setSelectedLandPrices(restoreData.selectedLandPrices));
        }
      }
    } catch (err) {
      console.error("Error parsing reopenModal data:", err);
      localStorage.removeItem("reopenModal");
    }
  }, [projects]);


  // ================== Set form values khi editingProject thay đổi ==================
  useEffect(() => {
    if (!editingProject) return;
    const formValues = {
      project_code: editingProject.project_code,
      project_name: editingProject.name,
      investor: editingProject.investor,
      approval_decision_no: editingProject.approval_decision_no,
      approval_date: editingProject.approval_date ? dayjs(editingProject.approval_date) : null,
      map_no: editingProject.map_no,
      map_approval_date: editingProject.map_approval_date ? dayjs(editingProject.map_approval_date) : null,
      land_price_decision_no: editingProject.land_price_decision_no,
      land_price_approval_date: editingProject.land_price_approval_date ? dayjs(editingProject.land_price_approval_date) : null,
      compensation_plan_decision_no: editingProject.compensation_plan_decision_no,
      compensation_plan_approval_date: editingProject.compensation_plan_approval_date ? dayjs(editingProject.compensation_plan_approval_date) : null,
      compensation_plan_no: editingProject.compensation_plan_no,
      plan_approval_date: editingProject.plan_approval_date ? dayjs(editingProject.plan_approval_date) : null,
      site_clearance_start_date: editingProject.site_clearance_start_date ? dayjs(editingProject.site_clearance_start_date) : null,
      project_status: editingProject.project_status,
      project_objectives: editingProject.project_objectives,
      project_scale: editingProject.project_scale,
      project_location: editingProject.project_location,
      construction_cost: editingProject.construction_cost,
      project_management_cost: editingProject.project_management_cost,
      consulting_cost: editingProject.consulting_cost,
      other_costs: editingProject.other_costs,
      contingency_cost: editingProject.contingency_cost,
      land_clearance_cost: editingProject.land_clearance_cost,
      start_point: editingProject.start_point,
      end_point: editingProject.end_point,
      total_length: editingProject.total_length,
      funding_source: editingProject.funding_source,
      resettlement_plan: editingProject.resettlement_plan,
      other_documents: editingProject.other_documents,
      approval_decision_file: convertFileList(editingProject.approval_decision_file),
      map_file: convertFileList(editingProject.map_file),
      land_price_file: convertFileList(editingProject.land_price_file),
      plan_file: convertFileList(editingProject.plan_file),
      compensation_plan_file: convertFileList(editingProject.compensation_plan_file),
      other_files: convertFileList(editingProject.other_files),
    };

    form.setFieldsValue(formValues);

    dispatch(setSelectedHouseholds(editingProject.households || []));
    dispatch(setSelectedEmployees(editingProject.employees || []));
    dispatch(setSelectedLandPrices(editingProject.lands || []));
  }, [editingProject, form, dispatch]);

  // ================== Restore tempFormData khi mở modal ==================
  useEffect(() => {
    if (!isModalVisible) return;
    const tempData = localStorage.getItem("tempFormData");
    if (!tempData) return;

    try {
      const { formValues, selectedHouseholds, selectedEmployees, selectedLandPrices } = JSON.parse(tempData);

      if (formValues) {
        const formattedValues = {
          ...formValues,
          approval_date: formValues.approval_date ? dayjs(formValues.approval_date) : null,
          map_approval_date: formValues.map_approval_date ? dayjs(formValues.map_approval_date) : null,
          land_price_approval_date: formValues.land_price_approval_date ? dayjs(formValues.land_price_approval_date) : null,
          plan_approval_date: formValues.plan_approval_date ? dayjs(formValues.plan_approval_date) : null,
          compensation_plan_approval_date: formValues.compensation_plan_approval_date ? dayjs(formValues.compensation_plan_approval_date) : null,
          site_clearance_start_date: formValues.site_clearance_start_date ? dayjs(formValues.site_clearance_start_date) : null,
        };
        form.setFieldsValue(formattedValues);
      }

      if (selectedHouseholds?.length) dispatch(setSelectedHouseholds(selectedHouseholds));
      if (selectedEmployees?.length) dispatch(setSelectedEmployees(selectedEmployees));
      if (selectedLandPrices?.length) dispatch(setSelectedLandPrices(selectedLandPrices));

      localStorage.removeItem("tempFormData");
    } catch (err) {
      console.error("Error parsing temporary data:", err);
      localStorage.removeItem("tempFormData");
    }
  }, [isModalVisible, form, dispatch]);
  // ================== Open modal ==================
  const openModal = (project = null) => {
    form.resetFields();
    setEditingProject(project);

    if (!project) {
      // 👉 Thêm mới: clear state chọn hộ dân & nhân viên
      dispatch(clearHouseholds());
      dispatch(clearEmployees());
      dispatch(clearLandPrices());
    } else {
      // 👉 Sửa: map dữ liệu project vào form
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
        project_location: project.project_location,
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

      // 👉 Nếu households/employees đã load ở trang khác thì chỉ cần dispatch lại
      dispatch(setSelectedHouseholds(project.households || []));
      dispatch(setSelectedEmployees(project.employees || []));
      dispatch(setSelectedLandPrices(project.lands || []));
    }

    setIsModalVisible(true);
  };


  // ================== Add / Update ==================
  const handleSubmit = async (values) => {
    try {

      setUpdating(true);
      if (!values.project_code || !values.project_name) {
        message.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
        return;
      }
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
        project_location: savedProject.project_location,
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

  const renderFile = (file) => {
    if (!file) return "Không có";

    if (Array.isArray(file)) {
      return file.map((f, idx) => {
        const url = f.url || f;
        const fileName = f.name || f.url?.split("/").pop() || `Tệp ${idx + 1}`;
        return (
          <div key={idx}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {fileName}
            </a>
          </div>
        );
      });
    }

    if (typeof file === "string") {
      const fileName = file.split("/").pop();
      return (
        <a href={file} target="_blank" rel="noopener noreferrer">
          {fileName}
        </a>
      );
    }

    if (typeof file === "object") {
      return (
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          {file.name || file.url?.split("/").pop()}
        </a>
      );
    }

    return "Không có";
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
        width={1000}
      >
        <Divider orientation="left">Thông tin chung</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Mã dự án:</b></Col>
          <Col span={18}>{viewProject?.project_code || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Tên dự án:</b></Col>
          <Col span={18}>{viewProject?.project_name || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chủ đầu tư:</b></Col>
          <Col span={18}>{viewProject?.investor || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Trạng thái:</b></Col>
          <Col span={18}>{viewProject?.project_status || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Mục tiêu:</b></Col>
          <Col span={18}>{viewProject?.project_objectives || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Điểm đầu:</b></Col>
          <Col span={18}>{viewProject?.start_point || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Điểm cuối:</b></Col>
          <Col span={18}>{viewProject?.end_point || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Vị trí:</b></Col>
          <Col span={18}>{viewProject?.project_location || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Quy mô:</b></Col>
          <Col span={18}>{viewProject?.project_scale || "Chưa cập nhật"}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Số QĐ duyệt dự án:</b></Col>
          <Col span={18}>{viewProject?.approval_decision_no || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày QĐ:</b></Col>
          <Col span={18}>
            {viewProject?.approval_date ? dayjs(viewProject.approval_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>File QĐ:</b></Col>
          <Col span={18}>{renderFile(viewProject?.approval_decision_file)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Số bản đồ:</b></Col>
          <Col span={18}>{viewProject?.map_no || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày duyệt bản đồ:</b></Col>
          <Col span={18}>
            {viewProject?.map_approval_date ? dayjs(viewProject.map_approval_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>File bản đồ:</b></Col>
          <Col span={18}>{renderFile(viewProject?.map_file)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Số QĐ giá đất:</b></Col>
          <Col span={18}>{viewProject?.land_price_decision_no || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày duyệt giá đất:</b></Col>
          <Col span={18}>
            {viewProject?.land_price_approval_date ? dayjs(viewProject.land_price_approval_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>File giá đất:</b></Col>
          <Col span={18}>{renderFile(viewProject?.land_price_file)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Số QĐ phương án BT:</b></Col>
          <Col span={18}>{viewProject?.compensation_plan_decision_no || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày duyệt phương án BT:</b></Col>
          <Col span={18}>
            {viewProject?.compensation_plan_approval_date ? dayjs(viewProject.compensation_plan_approval_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>File phương án BT:</b></Col>
          <Col span={18}>{renderFile(viewProject?.compensation_plan_file)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Số phương án BT:</b></Col>
          <Col span={18}>{viewProject?.compensation_plan_no || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày duyệt kế hoạch:</b></Col>
          <Col span={18}>
            {viewProject?.plan_approval_date ? dayjs(viewProject.plan_approval_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>File kế hoạch:</b></Col>
          <Col span={18}>{renderFile(viewProject?.plan_file)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Tài liệu khác:</b></Col>
          <Col span={18}>{renderFile(viewProject?.other_documents)}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Nguồn vốn:</b></Col>
          <Col span={18}>{viewProject?.funding_source || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí tư vấn:</b></Col>
          <Col span={18}>{viewProject?.consulting_cost ? `${viewProject.consulting_cost} VND` : "0 VND"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí GPMB:</b></Col>
          <Col span={18}>{viewProject?.land_clearance_cost ? `${viewProject.land_clearance_cost} VND` : "0 VND"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí quản lý dự án:</b></Col>
          <Col span={18}>{viewProject?.project_management_cost ? `${viewProject.project_management_cost} VND` : "0 VND"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí xây dựng:</b></Col>
          <Col span={18}>{viewProject?.construction_cost ? `${viewProject.construction_cost} VND` : "0 VND"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí dự phòng:</b></Col>
          <Col span={18}>{viewProject?.contingency_cost ? `${viewProject.contingency_cost} VND` : "0 VND"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Chi phí khác:</b></Col>
          <Col span={18}>{viewProject?.other_costs ? `${viewProject.other_costs} VND` : "0 VND"}</Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Kế hoạch TĐC:</b></Col>
          <Col span={18}>{viewProject?.resettlement_plan || "Chưa cập nhật"}</Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Ngày bắt đầu GPMB:</b></Col>
          <Col span={18}>
            {viewProject?.site_clearance_start_date ? dayjs(viewProject.site_clearance_start_date).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}><b>Tổng chiều dài:</b></Col>
          <Col span={18}>{viewProject?.total_length ? `${viewProject.total_length}m` : "0m"}</Col>
        </Row>

        <Divider orientation="left">Hộ dân liên quan</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={24}>
            {(viewProject?.households || []).filter(h => h && h !== "undefined" && h.trim() !== "").length > 0
              ? (viewProject.households || [])
                .filter(h => h && h !== "undefined" && h.trim() !== "")
                .map((h, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#1890ff' }}>Hộ dân ID: {h}</span>
                  </div>
                ))
              : <span style={{ color: '#999' }}>Không có hộ dân nào</span>}
          </Col>
        </Row>

        <Divider orientation="left">Nhân sự tham gia</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={24}>
            {(viewProject?.employees || []).length > 0
              ? viewProject.employees.map((e, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#52c41a' }}>Nhân sự ID: {e}</span>
                </div>
              ))
              : <span style={{ color: '#999' }}>Không có nhân sự nào</span>}
          </Col>
        </Row>
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
          {/* Header */}
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
                        const formData = form.getFieldsValue();
                        localStorage.setItem("tempFormData", JSON.stringify({
                          formValues: formData,
                          selectedHouseholds,
                          selectedEmployees
                        }));
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({
                          type: "edit",
                          projectId: editingProject?.id
                        }));
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
                        const formData = form.getFieldsValue(true);
                        localStorage.setItem("tempFormData", JSON.stringify({
                          formValues: formData,
                          selectedHouseholds,
                          selectedEmployees
                        }));
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({
                          type: "add",
                          projectId: "new"
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

          {/* Các phần upload gọn nhờ FormUpload */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quyết định phê duyệt dự án:</label></Col>
            <Col span={4}><Form.Item name="approval_decision_no"><Input /></Form.Item></Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}><Form.Item name="approval_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}><FormUpload name="approval_decision_file" maxCount={5} /></Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Bản đồ hiện trạng vị trí:</label></Col>
            <Col span={4}><Form.Item name="map_no"><Input /></Form.Item></Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}><Form.Item name="map_approval_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}><FormUpload name="map_file" maxCount={5} /></Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Quyết định phê duyệt giá đất:</label></Col>
            <Col span={4}><Form.Item name="land_price_decision_no"><Input /></Form.Item></Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}><Form.Item name="land_price_approval_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}><FormUpload name="land_price_file" maxCount={5} /></Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Phương án BT, HT, TĐC:</label></Col>
            <Col span={4}><Form.Item name="compensation_plan_no"><Input /></Form.Item></Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}><Form.Item name="plan_approval_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}><FormUpload name="plan_file" maxCount={5} /></Col>
          </Row>

          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>QĐ phê duyệt phương án BT, HT, TĐC:</label></Col>
            <Col span={4}><Form.Item name="compensation_plan_decision_no"><Input /></Form.Item></Col>
            <Col span={3}><label>Ngày phê duyệt:</label></Col>
            <Col span={5}><Form.Item name="compensation_plan_approval_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={2}><label>Đính kèm:</label></Col>
            <Col span={6}><FormUpload name="compensation_plan_file" maxCount={5} /></Col>
          </Row>

          {/* Thời gian, trạng thái */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Ngày bắt đầu BTGPMB:</label></Col>
            <Col span={6}><Form.Item name="site_clearance_start_date"><DatePicker style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={3}><label>Trạng thái dự án:</label></Col>
            <Col span={4}>
              <Form.Item name="project_status">
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="planned">Planned</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="on_hold">On Hold</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Văn bản khác */}
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col span={4}><label>Văn bản đính kèm khác:</label></Col>
            <Col span={20}><FormUpload name="other_files" maxCount={10} /></Col>
          </Row>

          {/* Các trường text */}
          <Row gutter={16}><Col span={4}><label>Mục tiêu dự án:</label></Col><Col span={20}><Form.Item name="project_objectives"><Input.TextArea rows={1} /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={4}><label>Quy mô dự án:</label></Col><Col span={20}><Form.Item name="project_scale"><Input.TextArea rows={1} /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={4}><label>Địa điểm dự án:</label></Col><Col span={20}><Form.Item name="project_location"><Input.TextArea rows={1} /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={4}><label>Nguồn vốn dự án:</label></Col><Col span={20}><Form.Item name="funding_source"><Input.TextArea rows={1} /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={4}><label>Kế hoạch bố trí TĐC:</label></Col><Col span={20}><Form.Item name="resettlement_plan"><Input.TextArea rows={1} /></Form.Item></Col></Row>

          {/* Nhân viên */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6} style={{ textAlign: "right", fontWeight: 500 }}>
              Nhân viên ({selectedEmployees.length}):
            </Col>
            <Col span={18}>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                  const formData = form.getFieldsValue();
                  localStorage.setItem("tempFormData", JSON.stringify({
                    formValues: formData,
                    selectedHouseholds,
                    selectedEmployees
                  }));
                  setIsModalVisible(false);
                  localStorage.setItem("reopenModal", JSON.stringify({
                    type: editingProject ? "edit" : "add",
                    projectId: editingProject?.id || "new"
                  }));
                  navigate(`/system/admin/employees/${editingProject?.id || "new"}/edit`);
                }}
              >
                Thêm nhân viên
              </Button>
            </Col>
          </Row>

          {/* Buttons */}
          <Row gutter={16}>
            <Col span={24} style={{ textAlign: "right" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingProject(null);
                  dispatch(clearHouseholds());
                  dispatch(clearEmployees());
                  form.resetFields();
                  localStorage.removeItem("tempFormData");
                  localStorage.removeItem("reopenModal");
                }}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button type="primary" loading={updating} htmlType="submit">
                Lưu
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}