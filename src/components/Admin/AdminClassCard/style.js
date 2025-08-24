import styled from 'styled-components';

export const ClassCardWrapper = styled.div`
  .ant-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 100%;
  }

  .card-header {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      word-break: break-word;       // Cho tên dài xuống dòng
      white-space: normal;
    }
  }

  .info-grid {
    font-size: 15px;
    line-height: 1.6;
    strong {
      color: #333;
    }
  }

  .ant-tag {
    font-size: 13px;
    padding: 4px 8px;
  }

  .card-footer {
    text-align: right;
  }

  @media (max-width: 768px) {
    .card-footer {
      text-align: center;
    }
  }
`;
