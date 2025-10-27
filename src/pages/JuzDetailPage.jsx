import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import PlaybackSettingsDrawer from "../components/PlaybackSettingsDrawer";
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import data from "../../juzData.json";
import surahInJuz from "../../surahInJuz.json";
import { Divider } from "@mui/material";

export default function JuzDetailPage() {
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

  // Select All Handler
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedAyahRange([null, null]);
    }
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
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Juz (Para) {juz.number}
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

      <PlaybackSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        // Juz Info Props
        juzName={juz.name}
        juzNumber={juzNumber}
        totalJuzAyahs={juz.numberOfAyahs}
        ayahNumberFirstGlobal={ayahNumberFirstGlobal}
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
