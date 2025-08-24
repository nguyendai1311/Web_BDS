// import { useState, useEffect } from "react";
// import {
//   Table,
//   Input,
//   Button,
//   Tooltip,
//   Rate,
//   Space,
//   message,
//   Select,
// } from "antd";
// import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
// import axios from "axios";
// import dayjs from "dayjs";
// import {
//   PageHeader,
//   FilterContainer,
//   HeaderActions,
//   CenteredAction,
// } from "./style";
// const { Option } = Select;

// export default function AssessPage() {
//   const [reviews, setReviews] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedCourses, setSelectedCourses] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         setLoading(true);
//         // const res = await ReviewService.getAllReviews();
        
//         const formatted = res.map((r, idx) => ({
//           key: r._id,
//           student: r.user?.name || "Không rõ",
//           course: r.course?.name || "Không rõ",
//           rating: r.rating,
//           comment: r.comment,
//           date: dayjs(r.createdAt).format("YYYY-MM-DD"),
//         }));
//         setReviews(formatted);
//         setFiltered(formatted);
//       } catch (error) {
//         message.error("Lỗi khi tải đánh giá");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReviews();
//   }, []);

//   const courseOptions = [...new Set(reviews.map((r) => r.course))];

//   useEffect(() => {
//     const lower = search.toLowerCase();
//     const result = reviews.filter(
//       (r) =>
//         (r.student.toLowerCase().includes(lower) ||
//           r.comment.toLowerCase().includes(lower)) &&
//         (selectedCourses.length === 0 || selectedCourses.includes(r.course))
//     );

//     setFiltered(result);
//   }, [search, selectedCourses, reviews]);

//   const columns = [
//     {
//       title: "Học viên",
//       dataIndex: "student",
//       key: "student",
//     },
//     {
//       title: "Khoá học",
//       dataIndex: "course",
//       render: (course) => course
//     },
//     {
//       title: "Đánh giá",
//       dataIndex: "rating",
//       key: "rating",
//       render: (rating) => <Rate disabled defaultValue={rating} />,
//     },
//     {
//       title: "Nội dung",
//       dataIndex: "comment",
//       key: "comment",
//     },
//     {
//       title: "Ngày",
//       dataIndex: "date",
//       key: "date",
//     }
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <PageHeader>
//         <h2>Quản lý đánh giá</h2>
//         <HeaderActions />
//       </PageHeader>

//       <FilterContainer>
//         <Input
//           placeholder="Tìm theo học viên hoặc nội dung"
//           prefix={<SearchOutlined />}
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{ width: 300 }}
//         />
//         <Select
//           mode="multiple"
//           placeholder="Lọc theo khóa học"
//           value={selectedCourses}
//           onChange={setSelectedCourses}
//           style={{ width: 300 }}
//           allowClear
//         >
//           {courseOptions.map((course) => (
//             <Option key={course} value={course}>
//               {course}
//             </Option>
//           ))}
//         </Select>
//       </FilterContainer>

//       <Table
//         columns={columns}
//         dataSource={filtered}
//         pagination={{ pageSize: 5 }}
//         bordered
//         loading={loading}
//       />
//     </div>
//   );
// }
