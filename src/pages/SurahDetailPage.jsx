import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import PlaybackSettingsDrawer from "../components/PlaybackSettingsDrawer";
import data from "../../surahData.json";

export default function SurahDetailPage() {
  // Get the surahNumber parameter from the URL
  const { surahNumber: surahNumberParam } = useParams();
  const surahNumber = parseInt(surahNumberParam);

  // Get the surah data based on the URL parameter
  const surah = useMemo(() => {
    if (!isNaN(surahNumber) && surahNumber > 0 && surahNumber <= data.length) {
      return data[surahNumber - 1]; // data is 0-indexed, surah number is 1-indexed
    }
    // Fallback for an invalid number or initial render (optional: add error handling)
    return {
      number: 0,
      name: "Error",
      englishName: "Error",
      englishNameTranslation: "Not Found",
      numberOfAyahs: 0,
      revelationType: "",
      firstAyahIndex: 0,
    };
  }, [surahNumber]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);
  const [selectAll, setSelectAll] = useState(false); // Select All state

  // Determine the ordered start and end of the selection for display/play
  const [ayahStartSurahIndex, totalAyah] = useMemo(() => {
    const [start, end] = selectedAyahRange;
    if (start === null || end === null) return [null, 0];

    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);
    const count = maxAyah - minAyah + 1;
    return [minAyah, count];
  }, [selectedAyahRange]);

  // Calculate the global index of the first ayah for the Player component
  // Assuming `surah.firstAyahIndex` is the global index of the first ayah of the surah.
  const ayahNumberFirstGlobal = useMemo(() => {
    if (ayahStartSurahIndex === null) return null;
    // Calculate the global ayah index (1-based global ayah number)
    return surah.firstAyahIndex + ayahStartSurahIndex - 1;
  }, [surah.firstAyahIndex, ayahStartSurahIndex]);

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
    if (selectAll) {
      setSelectAll(false);
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

  // Select All Handler
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedAyahRange([null, null]);
    }
  };

  const ayahRangeText =
    ayahStartSurahIndex !== null && totalAyah > 0
      ? `${ayahStartSurahIndex} - ${ayahStartSurahIndex + totalAyah - 1}`
      : "None Selected";

  // Create an array of ayah numbers for mapping
  const ayahNumbers = Array.from(
    { length: surah.numberOfAyahs },
    (_, i) => i + 1
  );

  return (
    <Box sx={{ p: 2 }}>
      <Container maxWidth="md">
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
          justifyContent="center"
          sx={{ width: "100%" }}
        >
          {ayahNumbers.map((ayahNumber) => (
            <Grid item key={ayahNumber}>
              <AyahButton
                ayah={ayahNumber}
                isSelected={isAyahSelected(ayahNumber)}
                onClick={() => handleAyahSelection(ayahNumber)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

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

      <PlaybackSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        // Juz Info Props
        juzName={surah.name}
        juzNumber={surah.number}
        isSurah={true}
        ayahNumberFirstGlobal={ayahNumberFirstGlobal}
        totalJuzAyahs={surah.numberOfAyahs}
        ayahRangeText={ayahRangeText}
        totalAyahsSelected={totalAyah}
        // Select All Props
        selectAll={selectAll}
        onSelectAllChange={handleSelectAllChange}
        // Action Prop
        isDisabled={ayahNumberFirstGlobal === null || totalAyah === 0}
      />
    </Box>
  );
}
