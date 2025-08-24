import styled from "styled-components";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

// Tương đương .checkbox-root
export const WrapperCheckboxRoot = styled(CheckboxPrimitive.Root)`
  width: 16px;
  height: 16px;
  border: 2px solid #007bff;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 4px #007bff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &[data-state="checked"] {
    background-color: #007bff;
    color: white;
  }
`;

// Tương đương .checkbox-indicator
export const WrapperCheckboxIndicator = styled(CheckboxPrimitive.Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Tương đương .icon-check
export const WrapperIconCheck = styled(Check)`
  width: 14px;
  height: 14px;
`;
