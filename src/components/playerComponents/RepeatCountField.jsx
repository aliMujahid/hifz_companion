import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

export default function RepeatCountField({
  currentRepeat,
  setRepeatCount,
  repeatCount,
}) {
  const [internalRepeatCount, setInternalRepeatCount] = useState(1);
  useEffect(() => {
    setInternalRepeatCount(repeatCount);
  }, [repeatCount]);

  const commitRepeatCount = (value) => {
    const valueNum = parseInt(value, 10);

    if (isNaN(valueNum)) {
      setInternalRepeatCount(currentRepeat); // Revert to current on invalid
      return;
    }

    const newRepeatCount = Math.max(0, valueNum);

    if (newRepeatCount !== currentRepeat) {
      setRepeatCount(newRepeatCount);
      setPaused(false);
    } else {
      setInternalRepeatCount(currentRepeat);
    }
  };

  const handleRepeatCountBlur = () => {
    commitRepeatCount(internalRepeatCount);
  };

  const handleRepeatCountKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRepeatCount(e.target.value);

      e.target.blur();
    }
  };

  const handleInternalRepeatCountChange = (e) => {
    // Allow typing only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInternalRepeatCount(value);
  };

  return (
    <TextField
      type="text"
      size="small"
      sx={{ width: 60 }}
      value={internalRepeatCount}
      onChange={handleInternalRepeatCountChange}
      onBlur={handleRepeatCountBlur}
      onKeyDown={handleRepeatCountKeyDown}
    />
  );
}
