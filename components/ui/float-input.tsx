import { useState } from "react";
import { Input } from "./input";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export function FloatInput<T extends FieldValues>({
  className,
  type,
  field,
  ...props
}: React.ComponentProps<"input"> & { field: ControllerRenderProps<T> }) {
  const [inputValue, setInputValue] = useState<string>(
    field.value?.toString() ?? ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const parsed = parseFloat(val);
    if (!isNaN(parsed) && val.match(/^[-+]?[0-9]*\.?[0-9]*$/)) {
      field.onChange(parsed);
    }
  };

  return (
    <Input
      type="number"
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
}
