import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
  color: #000;
  font-size: 28px;
  font-weight: bold;
  margin: 30px auto 20px;
  text-align: center;

  @media (max-width: 576px) {
    font-size: 22px;
    margin: 20px auto 16px;
  }
`;

export const WrapperProfileContainer = styled.div`
  display: flex;
  gap: 40px;
  border: 1px solid #ccc;
  padding: 30px 40px;
  border-radius: 12px;
  background-color: #fefefe;
  width: fit-content;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    padding: 20px;
    width: 90%;
  }
`;

export const WrapperAvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const AvatarImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;

  @media (max-width: 576px) {
    width: 100px;
    height: 100px;
  }
`;

export const DefaultAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #999;
  border: 2px solid #ccc;

  @media (max-width: 576px) {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }
`;

export const WrapperUploadFile = styled(Upload)`
  & .ant-upload.ant-upload-select-picture-card {
    width: 60px !important;
    height: 60px !important;
    border-radius: 50%;
  }
  & .ant-upload-list-item-info {
    display: none;
  }
`;

export const WrapperInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 400px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const WrapperLabel = styled.label`
  color: #333;
  font-size: 14px;
  font-weight: 600;
  width: 140px;
  margin-bottom: 4px;
  white-space: nowrap;
`;

export const WrapperInput = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;

  & input,
  & select {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
  }

  & input:focus,
  & select:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 3px #1890ff55;
  }

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const WrapperButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;
