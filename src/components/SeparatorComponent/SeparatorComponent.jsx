import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import styled, { css } from "styled-components";

// Styled component với xử lý orientation
const StyledSeparator = styled(SeparatorPrimitive.Root)`
  background-color: #ddd;
  flex-shrink: 0;

  ${({ orientation }) =>
    orientation === "horizontal"
      ? css`
          height: 1px;
          width: 100%;
        `
      : css`
          width: 1px;
          height: 100%;
        `}
`;

const Separator = React.forwardRef(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <StyledSeparator
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={className}
      {...props}
    />
  )
);

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
