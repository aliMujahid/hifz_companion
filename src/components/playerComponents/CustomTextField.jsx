import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

export default function CustomTextField({
  setOuterValue,
  outerValue,
}) {
  const [internalValue, setInternalValue] = useState(1);
  useEffect(() => {
    setInternalValue(outerValue);
  }, [outerValue]);

  const commitValue = (value) => {
    const valueNum = parseInt(value, 10);

    if (isNaN(valueNum)) {
      setInternalValue(outerValue); // Revert to current on invalid
      return;
    }

    const newValue = Math.max(0, valueNum);

    if (newValue !== outerValue) {
      setOuterValue(newValue);
    } else {
      setInternalValue(outerValue);
    }
  };

  const handleInputFieldBlur = () => {
    commitValue(internalValue);
  };

  const handleInputFieldKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(e.target.value);

      e.target.blur();
    }
  };

  const handleInternalValueChange = (e) => {
    // Allow typing only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInternalValue(value);
  };

  return (
    <TextField
      type="text"
      size="small"
      sx={{ width: 60 }}
      value={internalValue}
      onChange={handleInternalValueChange}
      onBlur={handleInputFieldBlur}
      onKeyDown={handleInputFieldKeyDown}
    />
  );
}
