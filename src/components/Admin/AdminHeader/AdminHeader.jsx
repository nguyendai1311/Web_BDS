import React from "react"
import { useLocation } from "react-router-dom"
import { Avatar, Badge, Input, Dropdown, Menu } from "antd"
import { 
  HomeFilled, 
  BellOutlined, 
  SearchOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from "@ant-design/icons"

const ClassPageHeader = () => {
  const location = useLocation()

  const getTitleFromPath = (pathname) => {
    if (pathname.includes("classes")) return "Danh sách lớp"
    if (pathname.includes("schedule")) return "Thời khóa biểu"
    if (pathname.includes("teacher/schedule")) return "Lịch dạy"
    if (pathname.includes("courses")) return "Quản lý khóa học"
    if (pathname.includes("employees")) return "Nhân viên"
    if (pathname.includes("payment")) return "Quản lý thanh toán"
    if (pathname.includes("teachers")) return "Giảng viên"
    if (pathname.includes("exams")) return "Quản lý bài thi"
    if (pathname.includes("assess")) return "Quản lý đánh giá"
    if (pathname.includes("blog")) return "Quản lý bài viết"
    if (pathname.includes("report")) return "Báo cáo & thống kê"
    if (pathname.includes("score-management")) return "Quản lý điểm"
    return "Hệ thống"
  }

  const title = getTitleFromPath(location.pathname)

  // Menu dropdown cho avatar
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        danger
        onClick={() => {
          // TODO: logic logout ở đây
          console.log("Đăng xuất")
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-3 sticky top-0 z-10 h-16">
      {/* Left: Home icon + title */}
      <div className="flex items-center gap-3 h-full">
        <HomeFilled className="text-blue-500 text-2xl" />
        <h2 className="text-gray-800 font-semibold text-lg">{title}</h2>
      </div>

      {/* Right: Search, Notification, Avatar */}
      <div className="flex items-center gap-5 h-full">
        {/* Search input */}
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-56 rounded-full h-10"
        />

        {/* Notification */}
        <Badge count={3} offset={[0, 5]}>
          <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition" />
        </Badge>

        {/* Avatar + Dropdown */}
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Avatar
            size={40}
            src="https://i.pravatar.cc/150?img=3"
            className="cursor-pointer hover:opacity-80 transition"
          />
        </Dropdown>
      </div>
    </header>
  )
}

export default ClassPageHeader
