import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`;

export const Main = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
  color: #000;

  h2 {
    margin-top: 0;
    color: #333;
    font-size: clamp(18px, 2.5vw, 24px);
    font-weight: 600;
    margin-bottom: 16px;
  }

  .ant-row {
    margin-top: 16px;
  }
`;

export const ClassCardWrapper = styled.div`
  background-color: #37474f;
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  }
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const DateDisplay = styled.span`
  font-size: clamp(14px, 2vw, 18px);
  color: #555;
`;
    
