// src/components/PlaybackSettingsDrawer.jsx

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PlaybackSettingsDrawer({
  isOpen,
  onClose,
  juzName,
  juzNumber,
  isSurah = false,
  totalJuzAyahs,
  ayahNumberFirstGlobal,
  ayahRangeText,
  totalAyahsSelected,

  // Select All Props
  selectAll,
  onSelectAllChange,

  // Action Prop
  isDisabled,
}) {
  const theme = useTheme();
  const [gapSeconds, setGapSeconds] = useState(0);
  const [repetition, setRepetition] = useState(1); // Default 1 repetition
  const [showText, setShowText] = useState(false); // Default show text

  const [repetitionDraft, setRepetitionDraft] = useState(String(repetition));
  const [gapDraft, setGapDraft] = useState(String(gapSeconds));

  useEffect(() => {
    setRepetitionDraft(String(repetition));
  }, [repetition]);

  useEffect(() => {
    setGapDraft(String(gapSeconds));
  }, [gapSeconds]);

  // Repetition Handlers
  const handleRepetitionCommit = () => {
    const num = parseInt(repetitionDraft, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      setRepetitionDraft(String(repetition));
    } else {
      setRepetition(num);
    }
  };
  const handleRepetitionDraftChange = (e) => setRepetitionDraft(e.target.value);

  // Gap Handlers
  const handleGapCommit = () => {
    const num = parseFloat(gapDraft);
    if (isNaN(num) || num < 0 || num > 1000) {
      setGapDraft(String(gapSeconds));
    } else {
      setGapSeconds(num);
    }
  };
  const handleGapDraftChange = (e) => setGapDraft(e.target.value);
  const handleGapSliderChange = (_, newValue) => setGapSeconds(newValue);

  // Show Text Handler
  const handleShowTextChange = (e) => setShowText(e.target.checked);

  // Helper function for repetition validation (for display only)
  const isRepetitionInvalid =
    parseInt(repetitionDraft, 10) < 1 ||
    parseInt(repetitionDraft, 10) > 100 ||
    isNaN(parseInt(repetitionDraft, 10));

  // Helper function for gap validation (for display only)
  const isGapInvalid =
    parseFloat(gapDraft) < 0 ||
    parseFloat(gapDraft) > 1000 ||
    isNaN(parseFloat(gapDraft));

  const navigate = useNavigate();

  const handleStartListening = () => {
    if (ayahNumberFirstGlobal === null || totalAyahsSelected === 0) return;

    handleRepetitionCommit();
    handleGapCommit();

    const queryParams = new URLSearchParams({
      start: ayahNumberFirstGlobal,
      count: totalAyahsSelected,
      gap: gapSeconds,
      rep: repetition,
      show: showText ? "true" : "false",
    }).toString();

    navigate(`/play?${queryParams}`);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "90%", sm: 500, md: 900 },
          maxWidth: "100%",
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" mr={3} dir="rtl" fontFamily={"alQalam"}>
                {juzName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSurah ? "Surah" : "Juz"} No. {juzNumber} | Total Ayahs:{" "}
                {totalJuzAyahs}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} aria-label="Close text drawer">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Settings Section */}
        <Box sx={{ mt: 3 }}>
          {/* Selected Ayahs Display */}
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Selected Ayahs {isSurah ? "" : "(Juz-local)"}:
          </Typography>

          {/* Select All Ayahs Checkbox */}
          <FormControlLabel
            control={
              <Checkbox checked={selectAll} onChange={onSelectAllChange} />
            }
            label="Select All Ayahs in Juz"
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              p: 1.5,
              mb: 3,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant="h5">{ayahRangeText}</Typography>
          </Box>

          {/* Repetition Input */}
          <Typography variant="body1" gutterBottom>
            **Repetition of each ayah:**
          </Typography>
          <TextField
            fullWidth
            label="Number of Repeats"
            type="number"
            value={repetitionDraft}
            onChange={handleRepetitionDraftChange}
            onBlur={handleRepetitionCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRepetitionCommit();
              }
            }}
            error={isRepetitionInvalid}
            helperText={
              isRepetitionInvalid ? "Value must be between 1 and 100." : ""
            }
            sx={{ mb: 3 }}
          />

          {/* Gap Setting */}
          <Typography variant="body1" gutterBottom>
            **Set a gap (in seconds) in between ayahs:**
          </Typography>
          <TextField
            fullWidth
            label="Gap (seconds)"
            type="number"
            value={gapDraft}
            onChange={handleGapDraftChange}
            onBlur={handleGapCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGapCommit();
              }
            }}
            error={isGapInvalid}
            helperText={
              isGapInvalid ? "Value must be between 0 and 1000 seconds." : ""
            }
            sx={{ mb: 1 }}
          />

          {/* Gap Slider */}
          <Slider
            value={gapSeconds}
            onChange={handleGapSliderChange}
            min={0}
            max={30}
            step={1}
            marks={[
              { value: 0, label: "0s" },
              { value: 15, label: "15s" },
              { value: 30, label: "30s" },
            ]}
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />

          {/* Show Ayah Text Checkbox */}
          <FormControlLabel
            control={
              <Checkbox checked={showText} onChange={handleShowTextChange} />
            }
            label="Show Ayah Text During Playback"
            sx={{ mb: 4 }}
          />

          {/* Start Listening Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleStartListening}
            disabled={isDisabled}
          >
            Start Listening ({totalAyahsSelected} Ayahs)
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
