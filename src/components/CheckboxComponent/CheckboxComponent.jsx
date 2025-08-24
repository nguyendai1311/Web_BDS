import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  WrapperCheckboxRoot,
  WrapperCheckboxIndicator,
  WrapperIconCheck,
} from "./style";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <WrapperCheckboxRoot ref={ref} className={className} {...props}>
    <WrapperCheckboxIndicator>
      <WrapperIconCheck />
    </WrapperCheckboxIndicator>
  </WrapperCheckboxRoot>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
