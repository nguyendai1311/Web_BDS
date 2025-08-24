import styled from "styled-components";
import backgroundImage from "../../../assets/back-ground.jpg";

export const SigninContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(${backgroundImage}) no-repeat;
  background-size: cover;
  width: 100%;
  height: 100vh;
  padding: 16px;
`;

export const SigninForm = styled.div`
  width: 600px;
  height: 425px;
  border-radius: 10px;
  background: transparent;
  display: flex;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(100px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  color: #ffffff;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    flex-direction: column;
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const SigninContent = styled.div`
  flex: 1;
  padding: 40px 45px 24px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const StyledInputWrapper = styled.div`
  margin-bottom: 15px;
  position: relative;

  input {
    padding: 10px;
    background: transparent;
    border: 1px solid #ffffff;
    color: #fff;
    width: 100%;
    border-radius: 4px;

    &:hover,
    &:focus {
      background: transparent;
      border-color: #ffffff;
      outline: none;
    }

    &::placeholder {
      color: #fff;
    }
  }
`;

export const EyeIcon = styled.span`
  position: absolute;
  top: 4px;
  right: 8px;
  z-index: 10;
  padding: 10px;
  color: #fff;
  cursor: pointer;
`;

export const ForgotLink = styled.p`
  font-size: 14px;
  cursor: pointer;
  color: #fff;

  &:hover {
    text-decoration: underline;
    color: #1d1616;
  }
`;

export const SignupLink = styled.p`
  margin-top: 5px;
  font-size: 14px;
  color: #fff;
`;

export const BoldText = styled.span`
  padding: 5px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: #1d1616;
  }
`;
