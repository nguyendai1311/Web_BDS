import styled from "styled-components";
import { Rate } from "antd";
export const WrapperCourseCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px; /* Giới hạn chiều rộng tối đa */
  height: 450px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
  margin: auto; /* Canh giữa khi chỉ có 1 phần tử */
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;


export const WrapperThumbnail = styled.div`
  position: relative;
  height: 180px;
  background-color: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const WrapperBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: orange;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
`;

export const WrapperContent = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const WrapperRating = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
export const WrapperRate = styled(Rate)`
  font-size: 14px;

  &.ant-rate {
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  & .ant-rate-star {
    margin-inline-end: 2px;
  }
`;
export const WrapperScore = styled.span`
  font-size: 13px;
  color: #333;
  margin-left: 4px;
`;

export const WrapperTitle = styled.h3`
  font-size: 15px;
  font-weight: bold;
  line-height: 1.4;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const WrapperMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
`;

export const WrapperInstructor = styled.div`
  font-size: 13px;
  color: #555;
`;

export const WrapperFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

export const WrapperPrice = styled.div`
  display: flex;
  align-items: center;
`;

export const WrapperOldPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
  margin-right: 6px;
`;

export const WrapperNewPrice = styled.span`
  color: #d63031;
  font-size: 15px;
  font-weight: bold;
`;

export const WrapperBuyButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;
