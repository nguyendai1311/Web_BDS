import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import DashboardStats from "../../../components/Admin/AdminDashboardStats/AdminDashboardStats";
import ClassCard from "../../../components/Admin/AdminClassCard/AdminClassCard";
//import { getAllClasses } from "../../../services/ClassService";

const AdminDashboard = () => {
  const [classesToday, setClassesToday] = useState([]);
  const today = new Date();
  const formattedDate = today.toLocaleDateString("vi-VN");

  const todayName = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][today.getDay()];

  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     try {
  //       //const res = await getAllClasses();
    
  //       // 👇 lấy mảng lớp học từ `res.data`
  //     //  const filtered = res.data.filter((cls) =>
  //         cls.schedule?.some((s) =>
  //           s.day?.toLowerCase() === todayName.toLowerCase()
  //         )
  //       );
  //       setClassesToday(filtered);
  //     } catch (error) {
  //       console.error("Lỗi khi tải lớp học:", error);
  //     }
  //   };
    
    
  //   fetchClasses();
  // }, [todayName]);

  return (
    <div>
      <DashboardStats />
      <h2>Hôm nay: {formattedDate}</h2>

      <Row gutter={[16, 16]}>
        {classesToday.map((cls) => (
          <Col key={cls._id} xs={24} sm={24} md={12} lg={12} xl={12}>
            <ClassCard {...cls} todayName={todayName} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard;

