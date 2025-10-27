// src/pages/JuzDetailPage.jsx

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
// REMOVED: Drawer, CloseIcon, Divider, Slider, TextField, Checkbox, FormControlLabel, Button
// Import the new Drawer component
import PlaybackSettingsDrawer from "../components/PlaybackSettingsDrawer";

import { useParams, useNavigate } from "react-router-dom";
// REMOVED: Slider, TextField, Checkbox, FormControlLabel, Button

import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useMemo } from "react";
import data from "../../juzData.json";
import surahInJuz from "../../surahInJuz.json";
import { Divider } from "@mui/material";

export default function JuzDetailPage() {
  const theme = useTheme();
  const { juzNumber: juzNumberParam } = useParams();
  const juzNumber = parseInt(juzNumberParam);

  // Get the juz data based on the URL parameter
  const juz = useMemo(() => {
    // ... (juz definition remains the same)
    if (!isNaN(juzNumber) && juzNumber > 0 && juzNumber <= data.length) {
      return data[juzNumber - 1];
    }
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
  const [selectAll, setSelectAll] = useState(false); // Select All state

  const [gapSeconds, setGapSeconds] = useState(2); // Default 2 seconds
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
  const ayahNumberFirstGlobal = useMemo(() => {
    if (ayahStartIndex === null) return null;
    return juz.firstAyahIndex + ayahStartIndex - 1;
  }, [juz.firstAyahIndex, ayahStartIndex]);

  // Effect to open the drawer when a full range is selected
  useEffect(() => {
    const [start, end] = selectedAyahRange;
    if (selectAll || (start !== null && end !== null && totalAyah > 0)) {
      setIsDrawerOpen(true);
    }
  }, [selectedAyahRange, totalAyah, selectAll]);

  // Handle a click on an AyahButton
  const handleAyahSelection = (ayahNumber) => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedAyahRange([ayahNumber, null]);
      return;
    }

    const [start, end] = selectedAyahRange;

    if (start === null) {
      setSelectedAyahRange([ayahNumber, null]);
    } else if (end === null) {
      setSelectedAyahRange([start, ayahNumber]);
    } else {
      setSelectedAyahRange([ayahNumber, null]);
    }
  };

  // Checks if an ayah number is within the selected range (inclusive)
  const isAyahSelected = (ayahNumber) => {
    if (selectAll) return true;

    const [start, end] = selectedAyahRange;

    if (start === null) return false;

    if (end === null) return ayahNumber === start;

    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);

    return ayahNumber >= minAyah && ayahNumber <= maxAyah;
  };

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
    if (isNaN(num) || num < 0 || num > 30) {
      setGapDraft(String(gapSeconds));
    } else {
      setGapSeconds(num);
    }
  };
  const handleGapDraftChange = (e) => setGapDraft(e.target.value);
  const handleGapSliderChange = (_, newValue) => setGapSeconds(newValue);

  // Show Text Handler
  const handleShowTextChange = (e) => setShowText(e.target.checked);

  // Select All Handler
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedAyahRange([null, null]);
    }
  };

  const navigate = useNavigate();

  const handleStartListening = () => {
    if (ayahNumberFirstGlobal === null || totalAyah === 0) return;

    handleRepetitionCommit();
    handleGapCommit();

    const queryParams = new URLSearchParams({
      start: ayahNumberFirstGlobal,
      count: totalAyah,
      gap: gapSeconds,
      rep: repetition,
      show: showText ? "true" : "false",
    }).toString();

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
      {/* ... (Juz content remains the same) */}
      <Typography
        variant="h4"
        fontFamily={"alQalam"}
        component="h1"
        gutterBottom
        align="center"
      >
        {juz.name}
      </Typography>
      {currentJuzSurahs.map((surah) => {
        return (
          <Container maxWidth="lg" key={surah.surah} sx={{ pt: 5 }}>
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
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            zIndex: 1200,
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
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              p: 1.5,
              "&:hover": { bgcolor: "primary.light" },
            }}
            aria-label="Open Ayah Text"
          >
            <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
          </IconButton>
        </Box>
      )}

      {/* NEW: Use the reusable PlaybackSettingsDrawer component */}
      <PlaybackSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        // Juz Info Props
        juzName={juz.name}
        juzNumber={juzNumber}
        totalJuzAyahs={juz.numberOfAyahs}
        ayahRangeText={ayahRangeText}
        totalAyahsSelected={totalAyah}
        // Repetition Props
        repetitionDraft={repetitionDraft}
        onRepetitionChange={handleRepetitionDraftChange}
        onRepetitionCommit={handleRepetitionCommit}
        // Gap Props
        gapSeconds={gapSeconds}
        gapDraft={gapDraft}
        onGapDraftChange={handleGapDraftChange}
        onGapCommit={handleGapCommit}
        onGapSliderChange={handleGapSliderChange}
        // Show Text Prop
        showText={showText}
        onShowTextChange={handleShowTextChange}
        // Select All Props
        selectAll={selectAll}
        onSelectAllChange={handleSelectAllChange}
        // Action Prop
        onStartListening={handleStartListening}
        isDisabled={ayahNumberFirstGlobal === null || totalAyah === 0}
      />
    </Box>
  );
}
