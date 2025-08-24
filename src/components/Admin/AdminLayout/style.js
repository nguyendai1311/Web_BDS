import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #b0bec5;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #b0bec5;
  overflow: hidden;
`;

export const Main = styled.main`
  flex: 1;
  padding: 24px;
  background-color: #b0bec5;
  overflow-y: auto;
  color: #333;
  min-height: 0;

  h1, h2, h3 {
    color: #333;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const HeaderWrapper = styled.header`
  background-color: #003366;
  color: #b0bec5;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const SidebarWrapper = styled.aside`
  width: 250px;
  background-color: #002244;
  color: #b0bec5;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    width: 150px;
  }
`;