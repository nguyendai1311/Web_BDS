import React from "react";
import {
  WrapperCourseCard,
  WrapperThumbnail,
  WrapperBadge,
  WrapperContent,
  WrapperRating,
  WrapperScore,
  WrapperTitle,
  WrapperMeta,
  WrapperInstructor,
  WrapperFooter,
  WrapperPrice,
  WrapperOldPrice,
  WrapperNewPrice,
  WrapperBuyButton,
  WrapperRate,
} from "./style";
import { useNavigate } from "react-router-dom";

function CourseCardComponent({ course, handleAddToCart, onClick }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/course-details/${course._id || course.id}`);
  };

  return (
    <WrapperCourseCard>
      {/* Hình thumbnail và badge */}
      <WrapperThumbnail onClick={handleViewDetails} style={{ cursor: "pointer" }}>
        <img src={course.imageUrl || course.image} alt={course.name} />
        {course.badge && <WrapperBadge>{course.badge}</WrapperBadge>}
      </WrapperThumbnail>

      {/* Nội dung chính */}
      <WrapperContent>
        {/* Đánh giá */}
        <WrapperRating>
          <WrapperRate disabled allowHalf defaultValue={course.rating || 0} />
          <WrapperScore>{(course.rating || 0).toFixed(1)}</WrapperScore>
        </WrapperRating>

        {/* Tên khóa học */}
        <WrapperTitle
          title={course.name}
          onClick={handleViewDetails}
          style={{ cursor: "pointer" }}
        >
          {course.name}
        </WrapperTitle>

        {/* Loại khóa học */}
        <WrapperMeta>
          <span>📘 {course.type || "Chưa rõ loại"}</span>
        </WrapperMeta>

        {/* Giảng viên + danh mục */}
        <WrapperInstructor>
          {course.description
            ? `${course.description.slice(0, 80)}${course.description.length > 80 ? "..." : ""}`
            : "Thông tin khóa học đang được cập nhật..."}
        </WrapperInstructor>



        {/* Footer: Giá và nút mua */}
        <WrapperFooter>
          <WrapperPrice>
            {course.originalPrice && (
              <WrapperOldPrice>
                {course.originalPrice.toLocaleString()}₫
              </WrapperOldPrice>
            )}
            <WrapperNewPrice>{course.price.toLocaleString()}₫</WrapperNewPrice>
          </WrapperPrice>
          <WrapperBuyButton onClick={handleViewDetails}>
            Mua khóa học
          </WrapperBuyButton>
        </WrapperFooter>
      </WrapperContent>
    </WrapperCourseCard>
  );
}

export default CourseCardComponent;
