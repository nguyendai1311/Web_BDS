import styled from "styled-components";

export const WrapperFilterContainer = styled.div``;

export const WrapperCourseFilter = styled.div`
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const WrapperFilterHeader = styled.div`
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

export const WrapperFilterTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const WrapperSearchInput = styled.div`
  position: relative;
  margin-top: 12px;

  input {
    padding-left: 36px !important;
    height: 38px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
    transition: border 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    z-index: 1;

    &:focus,
    &:hover {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    &::placeholder {
      color: #999;
    }
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #000;
  pointer-events: none;
  font-size: 16px;
  z-index: 2;
`;

export const WrapperFilterSection = styled.div`
  margin-bottom: 16px;
`;

export const WrapperFilterSectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: capitalize;
`;

export const WrapperFilterOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 6px;
`;
