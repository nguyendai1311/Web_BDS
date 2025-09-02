import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Admin/AdminSidebar/AdminSidebar";
import Header from "../../../components/Admin/AdminHeader/AdminHeader";
import { Wrapper, Content, Main } from "./style";

import AdminDashboard from "../../../pages/Admin/AdminDashboard/AdminDashboard";
import CitizenPage from "../../../pages/Admin/CitizenPage/CitizenPage";
import EmployeePage from "../../../pages/Admin/EmployeePage/EmployeePage";
import ProjectPage from "../../../pages/Admin/ProjectPage/ProjectPage";
import ReportPage from "../ReportPage/ReportPage";
import AssessPage from "../AssessPage/AssessPage";
import DetailPage from "../../../pages/Admin/DetailPage/DetailPage";
import EditPage from "../../../pages/Admin/EditPage/EditPage";
import LandPricePage from "../../../pages/Admin/LandPricePage/LandPricePage";

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const renderPage = () => {
    if (location.pathname === "/system/admin/citizens") {
      return <CitizenPage />;
    }
    if (location.pathname === "/system/admin/employees") {
      return <EmployeePage />;
    }
    if (location.pathname === "/system/admin/report") {
      return <ReportPage />;
    }
    if (location.pathname === "/system/admin/assess") {
      return <AssessPage />;
    }
   if (location.pathname === "/system/admin/project") {
      return <ProjectPage />;
    }
     if (location.pathname === "/system/admin/households/:id" ) {
      return <DetailPage />;
    }
    if (location.pathname === "/system/admin/employees/:id" ) {
      return <EditPage />;
    }
    if (location.pathname === "/system/admin/lands" ) {
      return <LandPricePage />;
    }
    
    return <AdminDashboard />;
  };

  return (
    <Wrapper>
      <Sidebar />
      <Content>
        <Header />
        <div>{children}</div>
        <Main>{renderPage()}</Main>
      </Content>
    </Wrapper>
  );
};

export default AdminLayout;


