import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

export default function AyahField({ setAyah, ayah, totalAyah, fromAyah = 0 }) {
  const [internalAyah, setInternalAyah] = useState(0);
  useEffect(() => {
    setInternalAyah(ayah);
  }, [ayah]);

  const commitAyah = (value) => {
    const valueNum = parseInt(value, 10);

    if (isNaN(valueNum)) {
      setInternalAyah(ayah); // Revert to current on invalid
      return;
    }

    const newAyah = fromAyah
      ? Math.min(Math.max(fromAyah, valueNum), totalAyah - 1)
      : Math.min(Math.max(0, valueNum), totalAyah - 1);

    if (newAyah !== ayah) {
      setAyah(newAyah);
    } else {
      setInternalAyah(ayah);
    }
  };

  const handleAyahBlur = () => {
    commitAyah(internalAyah);
  };

  const handleAyahKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitAyah(e.target.value);

      e.target.blur();
    }
  };

  const handleInternalAyahChange = (e) => {
    // Allow typing only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInternalAyah(value);
  };

  return (
    <TextField
      type="text"
      size="small"
      sx={{ width: 60 }}
      value={internalAyah}
      onChange={handleInternalAyahChange}
      onBlur={handleAyahBlur}
      onKeyDown={handleAyahKeyDown}
    />
  );
}
