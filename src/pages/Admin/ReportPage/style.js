import styled from "styled-components";

export const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .card-info {
    color: white;

    .ant-statistic-title,
    .ant-statistic-content {
      color: white !important;
    }
  }

  .total-students {
    background-color: #00bcd4;
  }

  .orders {
    background-color: #4caf50;
  }

  .revenue {
    background-color: #ff9800;
  }

  .best-course {
    background-color: #f44336;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 32px 0 20px;
  color: #000 !important;
`;

export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

export const FilterRow = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const FilterLabel = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: #333;
`;
