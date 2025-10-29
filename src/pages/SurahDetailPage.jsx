import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import data from "../../surahData.json";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SurahDetailPage() {
  const navigate = useNavigate();
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
  const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);
  const [selectAll, setSelectAll] = useState(false);
  const [playButtonVisible, setPlayButtonVisible] = useState(false);

  // Determine the ordered start and end of the selection for display/play
  const [ayahStartSurahIndex, totalAyah] = useMemo(() => {
    const [start, end] = selectedAyahRange;
    if (selectAll) {
      return [1, surah.numberOfAyahs]; // Start at 1, count is all ayahs
    }
    if (start === null || end === null) return [null, 0];

    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);
    const count = maxAyah - minAyah + 1;
    return [minAyah, count];
  }, [selectedAyahRange, selectAll]);

  // Calculate the global index of the first ayah for the Player component
  // Assuming `surah.firstAyahIndex` is the global index of the first ayah of the surah.
  const ayahNumberFirstGlobal = useMemo(() => {
    if (selectAll) {
      return surah.firstAyahIndex; // Global index of the first ayah
    }
    if (ayahStartSurahIndex === null) return null;
    // Calculate the global ayah index (1-based global ayah number)
    return surah.firstAyahIndex + ayahStartSurahIndex - 1;
  }, [surah.firstAyahIndex, ayahStartSurahIndex, selectAll]);

  // Effect to open the drawer when a full range is selected
  useEffect(() => {
    const [start, end] = selectedAyahRange;
    // Open the drawer only when a valid, two-point range is finalized
    const isRangeSelected = start !== null && end !== null && totalAyah > 0;
    if (isRangeSelected || selectAll) {
      setPlayButtonVisible(true);
    } else {
      setPlayButtonVisible(false);
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

  const handlePlayButtonClick = () => {
    if (ayahNumberFirstGlobal === null || totalAyah === 0) return;

    const queryParams = new URLSearchParams({
      start: ayahNumberFirstGlobal,
      count: totalAyah,
    }).toString();

    navigate(`/play?${queryParams}`);
  };

  const handleClosePlayButton = () => {
    setPlayButtonVisible(false);
    setSelectedAyahRange([null, null]);
    setSelectAll(false);
  };

  const handlePlayButtonClickWithStop = (e) => {
    e.stopPropagation();
    handlePlayButtonClick();
  };

  // Create an array of ayah numbers for mapping
  const ayahNumbers = Array.from(
    { length: surah.numberOfAyahs },
    (_, i) => i + 1
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          // Apply blur and transition when button is visible
          filter: playButtonVisible ? "blur(4px)" : "none",
          transition: "filter 0.2s ease-in-out",
          // Prevent clicking on the blurred content
          pointerEvents: playButtonVisible ? "none" : "auto",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              {surah.englishName}
            </Typography>
            <Typography
              variant="h4"
              fontFamily={"alQalam"}
              component="h1"
              gutterBottom
              align="center"
            >
              {surah.name}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 2,
              my: 2,
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "2rem",
              }}
            >
              Select Ayaat to Play
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  name="selectAll"
                  color="primary"
                />
              }
              label="Select All Ayaat"
              sx={{
                // Style the label text
                "& .MuiTypography-root": {
                  fontSize: "1.1rem",
                  fontWeight: "500",
                },
              }}
            />
          </Box>
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
      </Box>
      {playButtonVisible && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent backdrop
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300, // Ensure it's on top of other content
          }}
          onClick={handleClosePlayButton} // Click on backdrop closes it
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePlayButtonClickWithStop} // Click on button plays
            sx={{
              // Add some styling to make the button stand out
              padding: "16px 32px",
              fontSize: "1.2rem",
              boxShadow: 6, // Add a shadow
            }}
          >
            Play Selected Ayaat
          </Button>
        </Box>
      )}
    </Box>
  );
}
