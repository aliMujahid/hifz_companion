import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";

import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useMemo } from "react";
import data from "../../juzData.json";
import surahInJuz from "../../surahInJuz.json";

export default function JuzDetailPage() {
  const theme = useTheme();
  // Get the juzNumber parameter from the URL
  const { juzNumber: juzNumberParam } = useParams();
  const juzNumber = parseInt(juzNumberParam);

  // Get the juz data based on the URL parameter
  const juz = useMemo(() => {
    if (!isNaN(juzNumber) && juzNumber > 0 && juzNumber <= data.length) {
      return data[juzNumber - 1]; // data is 0-indexed, juz number is 1-indexed
    }
    // Fallback for an invalid number or initial render (optional: add error handling)
    return {
      name: "Error",
      englishName: "Error",
      englishNameTranslation: "Not Found",
      numberOfAyahs: 0,
      firstAyahIndex: 0,
    };
  }, [juzNumber]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);
  const [selectAll, setSelectAll] = useState(false);

  const [gapSeconds, setGapSeconds] = useState(0); // Default 2 seconds
  const [repetition, setRepetition] = useState(1); // Default 1 repetition
  const [showText, setShowText] = useState(true); // Default show text

  const [repetitionDraft, setRepetitionDraft] = useState(String(repetition));
  const [gapDraft, setGapDraft] = useState(String(gapSeconds));

  useEffect(() => {
    setRepetitionDraft(String(repetition));
  }, [repetition]);

  useEffect(() => {
    setGapDraft(String(gapSeconds));
  }, [gapSeconds]);

  // Determine the ordered start and end of the selection for display/play
  const [ayahStartIndex, totalAyah] = useMemo(() => {
    if (selectAll) {
      return [1, juz.numberOfAyahs];
    }
    const [start, end] = selectedAyahRange;
    if (start === null || end === null) return [null, 0];

    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);
    const count = maxAyah - minAyah + 1;
    return [minAyah, count];
  }, [selectedAyahRange, selectAll, juz.numberOfAyahs]);

  // Calculate the global index of the first ayah for the Player component
  // Assuming `juz.firstAyahIndex` is the global index of the first ayah of the juz.
  const ayahNumberFirstGlobal = useMemo(() => {
    if (ayahStartIndex === null) return null;
    // Calculate the global ayah index (1-based global ayah number)
    return juz.firstAyahIndex + ayahStartIndex - 1;
  }, [juz.firstAyahIndex, ayahStartIndex]);

  // Effect to open the drawer when a full range is selected
  useEffect(() => {
    const [start, end] = selectedAyahRange;
    // Open the drawer only when a valid, two-point range is finalized
    if (start !== null && end !== null && totalAyah > 0) {
      setIsDrawerOpen(true);
    }
  }, [selectedAyahRange, totalAyah]);

  // Handle a click on an AyahButton
  const handleAyahSelection = (ayahNumber) => {
    // If selectAll is true, clear it first
    if (selectAll) {
      setSelectAll(false);
      // Start a new selection from the clicked ayah
      setSelectedAyahRange([ayahNumber, null]);
      return;
    }

    const [start, end] = selectedAyahRange;

    if (start === null) {
      // First click: Set the start
      setSelectedAyahRange([ayahNumber, null]);
    } else if (end === null) {
      // Second click: Set the end and finalize the range
      setSelectedAyahRange([start, ayahNumber]);
    } else {
      // Third click (or beyond): Start a new selection
      // We set the new start and clear the end
      setSelectedAyahRange([ayahNumber, null]);
    }
  };

  // Checks if an ayah number is within the selected range (inclusive)
  const isAyahSelected = (ayahNumber) => {
    if (selectAll) return true;

    const [start, end] = selectedAyahRange;

    if (start === null) return false;

    // If only start is selected
    if (end === null) return ayahNumber === start;

    // If a full range is selected
    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);

    return ayahNumber >= minAyah && ayahNumber <= maxAyah;
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    // Clear the manual selection when "Select All" is checked
    if (isChecked) {
      setSelectedAyahRange([null, null]);
    }
  };

  const handleRepetitionCommit = () => {
    const num = parseInt(repetitionDraft, 10);

    // Validation Logic
    if (isNaN(num) || num < 1 || num > 1000) {
      // Reset the draft state to the last valid value if input is invalid
      setRepetitionDraft(String(repetition));
    } else {
      // Update the main repetition state
      setRepetition(num);
    }
  };

  const handleGapCommit = () => {
    // Parse the draft value as a float to allow decimal seconds
    const num = parseFloat(gapDraft);

    // Validation Logic (0 to 30 seconds)
    if (isNaN(num) || num < 0 || num > 1000) {
      // Reset the draft state to the last valid value
      setGapDraft(String(gapSeconds));
    } else {
      // Update the main gapSeconds state
      setGapSeconds(num);
    }
  };

  const navigate = useNavigate();

  const handleStartListening = () => {
    if (ayahNumberFirstGlobal === null || totalAyah === 0) return;

    handleRepetitionCommit();
    handleGapCommit();

    // Construct query string with all required parameters
    const queryParams = new URLSearchParams({
      start: ayahNumberFirstGlobal,
      count: totalAyah,
      gap: gapSeconds,
      rep: repetition,
      show: showText ? "true" : "false",
    }).toString();

    // Navigate to a new playback page (e.g., '/play') with query parameters
    // You should define a route for this new page.
    navigate(`/play?${queryParams}`);
  };

  const ayahRangeText =
    ayahStartIndex !== null && totalAyah > 0
      ? `${ayahStartIndex} - ${ayahStartIndex + totalAyah - 1}`
      : "None Selected";

  const currentJuzSurahs = surahInJuz[juzNumber - 1]
    ? surahInJuz[juzNumber - 1].surahs
    : [];

  let juzLocalAyahIndex = 1;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Juz (Para) {juz.number}
      </Typography>
      <Divider />
      {currentJuzSurahs.map((surah) => {
        return (
          <Container maxWidth="lg" sx={{ pt: 5 }} key={surah.surah}>
            <Typography
              variant="h4"
              fontFamily={"alQalam"}
              component="h1"
              gutterBottom
              align="center"
            >
              {surah.name}
            </Typography>
            <Grid
              container
              spacing={2}
              justifyContent="left"
              sx={{ width: "100%" }}
            >
              {surah.ayahs.map((ayah) => {
                const currentJuzLocalIndex = juzLocalAyahIndex;

                juzLocalAyahIndex++;

                return (
                  <Grid item key={`${surah.surah}:${ayah}`}>
                    <AyahButton
                      ayah={ayah}
                      isSelected={isAyahSelected(currentJuzLocalIndex)}
                      onClick={() => handleAyahSelection(currentJuzLocalIndex)}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Divider />
          </Container>
        );
      })}

      {!isDrawerOpen && totalAyah > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: "50%", // Center vertically
            right: 0, // Position on the far right
            transform: "translateY(-50%)", // Adjust for vertical centering
            zIndex: 1200, // Ensure it's above content but below the open drawer (1300)
            // Use a slight offset from the edge for better visibility
            mr: 0,
          }}
        >
          <IconButton
            color="primary"
            onClick={() => setIsDrawerOpen(true)}
            size="large"
            sx={{
              bgcolor: "background.paper",
              boxShadow: 5,
              // Style the button to look like a tab/handle
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              p: 1.5,
              "&:hover": { bgcolor: "primary.light" },
            }}
            // Use a descriptive aria-label
            aria-label="Open Ayah Text"
          >
            {/* Using a Text or Message icon for text drawer */}
            <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
          </IconButton>
        </Box>
      )}

      {/* -------------------- RIGHT DRAWER FOR PLAYBACK SETTINGS -------------------- */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          // Style the Paper component of the Drawer
          "& .MuiDrawer-paper": {
            width: { xs: "90%", sm: 500, md: 900 }, // Responsive width
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
                <Typography
                  variant="h4"
                  mr={3}
                  dir="rtl"
                  fontFamily={"alQalam"}
                >
                  {juz.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Juz No. {juz.number} | Total Ayahs: {juz.numberOfAyahs}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close text drawer"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Settings Section */}
          <Box sx={{ mt: 3 }}>
            {/* Selected Ayahs Display */}
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Selected Ayahs (Juz-Local):
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              }
              label="Select All Ayahs"
              sx={{ mb: 1 }} // Reduced margin to bring it closer to the text
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
              onChange={(e) => setRepetitionDraft(e.target.value)}
              // Commit on blur (when focus leaves the field)
              onBlur={handleRepetitionCommit}
              // Commit on Enter key press
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRepetitionCommit();
                }
              }}
              // Display an error if the draft value is invalid (e.g., if we reset the draft after an invalid commit attempt)
              error={
                parseInt(repetitionDraft, 10) < 1 ||
                parseInt(repetitionDraft, 10) > 1000 ||
                isNaN(parseInt(repetitionDraft, 10))
              }
              helperText={
                parseInt(repetitionDraft, 10) < 1 ||
                parseInt(repetitionDraft, 10) > 1000 ||
                isNaN(parseInt(repetitionDraft, 10))
                  ? "Value must be between 1 and 100."
                  : ""
              }
              inputProps={{ min: 1, max: 100 }}
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
              // Update the draft state on change
              onChange={(e) => setGapDraft(e.target.value)}
              // Commit on blur
              onBlur={handleGapCommit}
              // Commit on Enter key press
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGapCommit();
                }
              }}
              // Validation for display
              error={
                parseFloat(gapDraft) < 0 ||
                parseFloat(gapDraft) > 1000 ||
                isNaN(parseFloat(gapDraft))
              }
              helperText={
                parseFloat(gapDraft) < 0 ||
                parseFloat(gapDraft) > 1000 ||
                isNaN(parseFloat(gapDraft))
                  ? "Value must be between 0 and 30 seconds."
                  : ""
              }
              inputProps={{ min: 0, max: 30 }}
              sx={{ mb: 1 }}
            />

            {/* Gap Slider */}
            <Slider
              value={gapSeconds}
              onChange={(_, newValue) => setGapSeconds(newValue)}
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
                <Checkbox
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                />
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
              disabled={ayahNumberFirstGlobal === null || totalAyah === 0}
            >
              Start Listening ({totalAyah} Ayahs)
            </Button>
          </Box>
        </Box>
      </Drawer>
      {/* ------------------ END RIGHT DRAWER ------------------ */}
    </Box>
  );
}
