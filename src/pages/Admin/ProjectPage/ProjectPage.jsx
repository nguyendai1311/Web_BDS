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
import { uploadFile } from "../../../services/FileService";

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

  // Lấy dữ liệu từ Redux
  const dispatch = useDispatch();
  const selectedHouseholds = useSelector(state => state.project?.selectedHouseholds || []);
  const selectedEmployees = useSelector(state => state.project?.selectedEmployees || []);
  const selectedLandPrices = useSelector(state => state.project?.selectedLandPrices || []);

  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

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
          lands: proj.lands,
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
    console.log('reopenData', reopenData);

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

    dispatch(setSelectedHouseholds((editingProject.households || []).map(id => ({ id }))));
    dispatch(setSelectedEmployees((editingProject.employees || []).map(id => ({ id }))));
    dispatch(setSelectedLandPrices((editingProject.lands || []).map(id => ({ id }))));
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

      // Hàm upload file trước và trả về URL
      const processFiles = async (fileList, fieldName) => {
        if (!fileList || !Array.isArray(fileList)) return null;
        const uploadedFiles = [];

        for (const f of fileList) {
          if (f.url) {
            uploadedFiles.push(f.url); // file đã có URL
          } else if (f.originFileObj) {
            try {
              const formData = new FormData();
              formData.append(fieldName, f.originFileObj);
              const res = await uploadFile(formData, user?.access_token);
              if (res?.files?.[0]?.url) {
                uploadedFiles.push(res.files[0].url);
              }
            } catch (uploadErr) {
              console.error("Error uploading file:", uploadErr);
              message.warning(`Không thể upload file ${f.name}`);
            }
          }
        }
        return uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles;
      };

      // Upload tất cả file trước
      const uploadedApprovalDecisionFile = await processFiles(values.approval_decision_file, 'approval_decision_file');
      const uploadedMapFile = await processFiles(values.map_file, 'map_file');
      const uploadedLandPriceFile = await processFiles(values.land_price_file, 'land_price_file');
      const uploadedCompensationPlanFile = await processFiles(values.compensation_plan_file, 'compensation_plan_file');
      const uploadedPlanFile = await processFiles(values.plan_file, 'plan_file');
      const uploadedOtherFiles = await processFiles(values.other_files, 'other_files');

      // Chuẩn bị payload JSON để gửi lên backend
      const payload = {
        project_code: values.project_code,
        project_name: values.project_name,
        investor: values.investor || "",
        approval_decision_no: values.approval_decision_no || "",
        approval_date: values.approval_date ? values.approval_date.format("YYYY-MM-DD") : "",
        map_no: values.map_no || "",
        map_approval_date: values.map_approval_date ? values.map_approval_date.format("YYYY-MM-DD") : "",
        land_price_decision_no: values.land_price_decision_no || "",
        land_price_approval_date: values.land_price_approval_date ? values.land_price_approval_date.format("YYYY-MM-DD") : "",
        compensation_plan_decision_no: values.compensation_plan_decision_no || "",
        compensation_plan_approval_date: values.compensation_plan_approval_date ? values.compensation_plan_approval_date.format("YYYY-MM-DD") : "",
        compensation_plan_no: values.compensation_plan_no || "",
        plan_approval_date: values.plan_approval_date ? values.plan_approval_date.format("YYYY-MM-DD") : "",
        site_clearance_start_date: values.site_clearance_start_date ? values.site_clearance_start_date.format("YYYY-MM-DD") : "",
        project_status: values.project_status || "",
        project_objectives: values.project_objectives || "",
        project_scale: values.project_scale || "",
        project_location: values.project_location || "",
        construction_cost: values.construction_cost || 0,
        project_management_cost: values.project_management_cost || 0,
        consulting_cost: values.consulting_cost || 0,
        other_costs: values.other_costs || 0,
        contingency_cost: values.contingency_cost || 0,
        land_clearance_cost: values.land_clearance_cost || 0,
        start_point: values.start_point || "",
        end_point: values.end_point || "",
        total_length: values.total_length || 0,
        funding_source: values.funding_source || "",
        resettlement_plan: values.resettlement_plan || "",
        approval_decision_file: uploadedApprovalDecisionFile,
        map_file: uploadedMapFile,
        land_price_file: uploadedLandPriceFile,
        compensation_plan_file: uploadedCompensationPlanFile,
        plan_file: uploadedPlanFile,
        other_documents: uploadedOtherFiles,
        households: selectedHouseholds.map(h => h.id).filter(Boolean),
        employees: selectedEmployees.map(e => e.id).filter(Boolean),
        lands: selectedLandPrices.map(e => e.id).filter(Boolean),

      };

      let result;
      if (editingProject) {
        result = await ProjectService.updateProject(editingProject.key, payload, user?.access_token);
        message.success("Cập nhật dự án thành công!");
      } else {
        result = await ProjectService.createProject(payload, user?.access_token);
        message.success("Thêm dự án thành công!");
      }

      // Xử lý cập nhật state local như trước
      const savedProject = result.data || result;
      const parsedHouseholds = typeof savedProject.households === 'string' ? JSON.parse(savedProject.households) : (savedProject.households || []);
      const parsedEmployees = typeof savedProject.employees === 'string' ? JSON.parse(savedProject.employees) : (savedProject.employees || []);
      const parsedLands = typeof savedProject.lands === 'string' ? JSON.parse(savedProject.lands) : (savedProject.lands || []);

      const projectItem = {
        key: savedProject.id,
        ...savedProject,
        households: parsedHouseholds,
        employees: parsedEmployees,
        lands: parsedLands
      };

      if (editingProject) {
        setProjects(prev => prev.map(p => p.key === projectItem.key ? projectItem : p));
        setFilteredProjects(prev => prev.map(p => p.key === projectItem.key ? projectItem : p));
      } else {
        setProjects(prev => [...prev, projectItem]);
        setFilteredProjects(prev => [...prev, projectItem]);
      }

      localStorage.removeItem("tempProjectData");
      localStorage.removeItem("selectedHouseholdsForNewProject");
      dispatch(clearHouseholds());
      dispatch(clearEmployees());
      dispatch(clearLandPrices());

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


const renderFile = (files) => {
  if (!files) return "Chưa có file";

  // Nếu BE trả về string (1 file)
  if (typeof files === "string") {
    const fileName = decodeURIComponent(files.split("/").pop().split("?")[0]);
    return (
      <a href={files} target="_blank" rel="noopener noreferrer">
        {fileName}
      </a>
    );
  }

  // Nếu BE trả về array
  if (Array.isArray(files) && files.length > 0) {
    return files.map((fileUrl, index) => {
      const fileName = decodeURIComponent(fileUrl.split("/").pop().split("?")[0]);
      return (
        <div key={index}>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
        </div>
      );
    });
  }

  return "Chưa có file";
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
        {/* Hộ dân */}
        <Divider orientation="left">Hộ dân liên quan</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={24}>
            {viewProject?.id && (
              <Button
                type="primary"
                onClick={() => navigate(`/system/admin/households/${viewProject.id}/view`)}
              >
                Xem tất cả hộ dân
              </Button>
            )}
          </Col>
        </Row>

        {/* Nhân sự */}
        <Divider orientation="left">Nhân sự tham gia</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={24}>
            {viewProject?.id && (
              <Button
                type="primary"
                onClick={() => navigate(`/system/admin/employees/${viewProject.id}/view`)}
              >
                Xem tất cả nhân sự
              </Button>
            )}
          </Col>
        </Row>

        {/* Bảng giá đất */}
        <Divider orientation="left">Bảng giá đất liên quan</Divider>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={24}>
            {viewProject?.id && (
              <Button
                type="primary"
                onClick={() => navigate(`/system/admin/lands/${viewProject.id}/view`)}
              >
                Xem tất cả bảng giá đất
              </Button>
            )}
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
                {/* Hộ dân */}
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
                          selectedEmployees,
                          selectedLandPrices
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
                          selectedEmployees,
                          selectedLandPrices
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

                {/* Đơn giá đất */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: 8, fontWeight: 500 }}>
                    Đơn giá đất ({selectedLandPrices.length}):
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
                          selectedEmployees,
                          selectedLandPrices
                        }));
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({
                          type: "edit",
                          projectId: editingProject?.id
                        }));
                        navigate(`/system/admin/lands/${editingProject?.id}/edit`);
                      }}
                    >
                      Sửa đơn giá đất
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
                          selectedEmployees,
                          selectedLandPrices
                        }));
                        setIsModalVisible(false);
                        localStorage.setItem("reopenModal", JSON.stringify({
                          type: "add",
                          projectId: "new"
                        }));
                        navigate(`/system/admin/lands/new/add`);
                      }}
                    >
                      Thêm đơn giá đất
                    </Button>
                  )}
                </div>
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
            <Col span={20}>
              <Form.Item
                name="other_files"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList || []}
              >
                <FormUpload maxCount={10} />
              </Form.Item>
            </Col>
          </Row>

          {/* Các trường text */}
          {[
            { label: "Mục tiêu dự án", name: "project_objectives" },
            { label: "Quy mô dự án", name: "project_scale" },
            { label: "Địa điểm dự án", name: "project_location" },
            { label: "Nguồn vốn dự án", name: "funding_source" },
            { label: "Kế hoạch bố trí TĐC", name: "resettlement_plan" },
          ].map((item, idx) => (
            <Row gutter={16} key={idx} style={{ marginBottom: 16 }}>
              <Col span={4}><label>{item.label}:</label></Col>
              <Col span={20}><Form.Item name={item.name}><Input.TextArea rows={1} /></Form.Item></Col>
            </Row>
          ))}

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
                    selectedEmployees,
                    selectedLandPrices
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
                  dispatch(clearLandPrices());
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
    </div >
  );
}