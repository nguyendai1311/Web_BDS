// import React, { useState, useEffect } from "react";
// import { Col, Row } from 'antd';
// import {
//   BookOutlined,
//   TeamOutlined,
//   UserOutlined,
//   AppstoreAddOutlined,
// } from '@ant-design/icons';
// import { motion } from "framer-motion";
// import { StyledCard } from './style';
// import * as ClassService from "../../../services/ClassService";
// import * as UserService from "../../../services/UserService";
// import * as CourseService from "../../../services/CourseService";

// const DashboardStats = () => {
//   const [totalEmployee, setTotalEmployees] = useState(0);
//   const [totalTeachers, setTotalTeachers] = useState(0);
//   const [totalClasses, setTotalClasses] = useState(0);
//   const [totalCourses, setTotalCourses] = useState(0);
//   const token = localStorage.getItem("access-token");

//   const fetchEmployee = async () => {
//     try {
//       const res = await UserService.getAllUser(token);
//       const employees = res.data;
//       const total = employees.reduce((acc, item) => acc + item.students.length, 0);
//       totalEmployee(total);
//     } catch (error) {
//       console.error("Lỗi lấy danh sách lớp học:", error);
//     }
//   };

//   const fetchTeachers = async () => {
//     try {
//       // const res = await UserService.getTotalTeachers();
//     //  setTotalTeachers(res.totalTeachers);
//     } catch (error) {
//       console.error("Lỗi lấy tổng số giảng viên:", error);
//     }
//   };

//   const fetchClasses = async () => {
//     try {
//       const res = await ClassService.getTotalClasses();
//       setTotalClasses(res.totalClasses);
//     } catch (error) {
//       console.error("Lỗi lấy tổng số lớp:", error);
//     }
//   };

//   const fetchCourses = async () => {
//     try {
//       const res = await CourseService.getAllCourse();
//       setTotalCourses(res.data.length);
//     } catch (error) {
//       console.error("Lỗi lấy danh sách khóa học:", error);
//     }
//   };

//   useEffect(() => {
//     fetchEmployee();
//     fetchTeachers();
//     fetchClasses();
//     fetchCourses();
//   }, [token]);

//   const stats = [

//     { label: 'Khóa học', value: totalCourses, icon: <BookOutlined />, color: '#00bcd4' },
//     { label: 'Nhân viên', value: totalEmployee, icon: <TeamOutlined />, color: '#4caf50' },
//     { label: 'Giảng viên', value: totalTeachers, icon: <UserOutlined />, color: '#ff9800' },
//     { label: 'Lớp đang học', value: totalClasses, icon: <AppstoreAddOutlined />, color: '#f44336' },
//   ];

//   return (
//     <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
//       {stats.map((stat, idx) => (
//         <Col xs={24} sm={12} md={12} lg={6} key={idx}>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3, delay: idx * 0.1 }}
//           >
//             <StyledCard $bg={stat.color}>
//               {stat.icon}
//               <h2>{stat.value}</h2>
//               <p>{stat.label}</p>
//             </StyledCard>
//           </motion.div>
//         </Col>
//       ))}
//     </Row>
//   );
// };

// export default DashboardStats;

import React from 'react'

const AdminDashboardStats = () => {
  return (
    <div>
      
    </div>
  )
}

export default AdminDashboardStats
