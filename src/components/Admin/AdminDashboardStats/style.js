import styled from "styled-components";

export const StyledCard = styled.div`
  background-color: ${(props) => props.$bg || "#fff"};
  color: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  h2 {
    font-size: 32px;
    margin: 12px 0 4px;
  }

  p {
    font-size: 16px;
    margin: 0;
    font-weight: 500;
  }

  svg {
    font-size: 36px;
  }
`;
