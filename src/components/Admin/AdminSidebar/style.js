import styled from "styled-components";
import { Modal } from "antd";

export const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;

  .ant-menu-dark.ant-menu-inline {
    background-color: transparent;
  }

  .ant-menu-item,
  .ant-menu-submenu-title {
    color: #cfd8dc;
    font-weight: 500;
    border-radius: 8px;
    margin: 4px 0;
    padding-left: 16px !important;
    transition: all 0.3s ease;
  }

  .ant-menu-item:hover,
  .ant-menu-submenu-title:hover {
    background-color: #34495e;
    color: #ffffff;
  }

  .ant-menu-item-selected {
    background-color: #1e88e5;
    color: #ffffff !important;
    font-weight: 600;
  }

  .ant-menu-submenu-open > .ant-menu-submenu-title {
    background-color: #2c3e50;
    color: #ffffff;
  }

  /* CHỈNH SUBMENU CĂN ĐỀU */
  .ant-menu-submenu .ant-menu {
    background-color: #2c3e50 !important;
    margin-left: 0px; /* <- bỏ lệch trái */
    padding: 4px 0;
    border-radius: 8px;
  }

  .ant-menu-submenu .ant-menu-item {
    border-radius: 6px;
    padding: 10px 24px !important; /* padding trái vừa bằng menu cha */
    margin: 4px 8px; /* thêm chút padding hai bên */
    color: #b0bec5;
    font-weight: 500;
  }

  .ant-menu-submenu .ant-menu-item:hover {
    background-color: #1e88e5;
    color: #ffffff;
  }

  .ant-menu-submenu .ant-menu-item-selected {
    background-color: #1e88e5;
    color: #ffffff !important;
    font-weight: 600;
  }

  .ant-menu-item .anticon,
  .ant-menu-submenu-title .anticon {
    font-size: 18px;
  }

  .ant-menu-item a {
    color: inherit;
  }

  .ant-menu-item a:hover {
    color: #ffffff;
  }

  .logo-link {
    text-decoration: none;
    display: block;
    color: inherit;
  }
`;
  

export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  img {
    width: 80px; /* hoặc 100px nếu bạn muốn to hơn */
    height: 80px;
    object-fit: contain;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    color: #ffffff;
  }

  .status {
    font-size: 12px;
    color: #4cd137;
    margin-top: 4px;
  }
`;


export const StyledModal = styled(Modal)`
  top: 50% !important;
  transform: translateY(-50%) !important;

  .ant-modal-content {
    text-align: center;
  }

  .ant-modal-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .ant-btn-primary {
    background-color: #e53935 !important;
    border-color: #e53935 !important;
    color: #ffffff !important;
    transition: all 0.3s ease;

    &:hover,
    &:focus,
    &:active {
      background-color: #e53935 !important;
      border-color: #e53935 !important;
      color: #ffffff !important;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
    }
  }
`;
