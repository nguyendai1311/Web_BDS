import React from "react";
import { useLocation } from "react-router-dom";
import { Select, Avatar, Badge } from "antd";
import { HomeFilled, BellOutlined, SearchOutlined } from "@ant-design/icons";
import { HeaderWrapper } from "./style";

const { Option } = Select;

const ClassPageHeader = () => {
  const location = useLocation();

  const getTitleFromPath = (pathname) => {
    if (pathname.includes("classes")) return "Danh sách lớp";
    if (pathname.includes("schedule")) return "Thời khóa biểu";
    if (pathname.includes("teacher/schedule")) return "Lịch dạy";
    if (pathname.includes("courses")) return "Quản lý khóa học";
    if (pathname.includes("employees")) return "Nhân viên";
    if (pathname.includes("payment")) return "Quản lý thanh toán";
    if (pathname.includes("teachers")) return "Giảng viên";
    if (pathname.includes("exams")) return "Quản lý bài thi";
    if (pathname.includes("assess")) return "Quản lý đánh giá";
    if (pathname.includes("blog")) return "Quản lý bài viết";
    if (pathname.includes("report")) return "Báo cáo & thống kê";
    if (pathname.includes("score-management")) return "Quản lý điểm";
    return "Hệ thống";
  };

  const title = getTitleFromPath(location.pathname);

  return (
    <HeaderWrapper>
      <div className="left">
        <HomeFilled className="home-icon" />
        <span className="title">{title}</span>
      </div>
    </HeaderWrapper>
  );
};

export default ClassPageHeader;
