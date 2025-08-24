import styled from 'styled-components';

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  .left {
    display: flex;
    align-items: center;
    gap: 10px;

    .home-icon {
      color: #52c41a;
      font-size: 18px;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;

    .location-label {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      background-color: #e6f4ff;
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid #91d5ff;

      .home-icon-inner {
        color: #1677ff;
        font-size: 16px;
        margin-right: 6px;
      }
    }

    .year-select {
      width: 120px;

      .ant-select-selector {
        border-radius: 6px;
      }
    }

    .icon {
      font-size: 18px;
      color: #444;
      cursor: pointer;
    }

    .username {
      font-size: 14px;
      font-weight: 500;
    }
  }
`;
