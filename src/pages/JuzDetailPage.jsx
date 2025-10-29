import { Box, Checkbox, FormControlLabel, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import data from "../../juzData.json";
import surahInJuz from "../../surahInJuz.json";
import surahData from "../../surahData.json";
import { Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function JuzDetailPage() {
  const navigate = useNavigate();
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

  const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);
  const [selectAll, setSelectAll] = useState(false);
  const [playButtonVisible, setPlayButtonVisible] = useState(false);

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
      setPlayButtonVisible(true);
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

  const currentJuzSurahs = surahInJuz[juzNumber - 1]
    ? surahInJuz[juzNumber - 1].surahs
    : [];

  let juzLocalAyahIndex = 1;

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
        {/* ... (Juz content remains the same) */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Juz (Para) {juz.number}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row", // Arrange items in a row
            alignItems: "center", // Vertically center them
            justifyContent: "center", // Horizontally center the group
            flexWrap: "wrap", // Allow wrapping on small screens
            gap: 2, // Add space between the items
            my: 2, // Add some vertical margin
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "2rem",
            }}
          >
            Selec Ayaat to Play
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
            label="Select All"
            sx={{
              // Style the label text
              "& .MuiTypography-root": {
                fontSize: "1.1rem",
                fontWeight: "500",
              },
            }}
          />
        </Box>
        {currentJuzSurahs.map((surah) => {
          return (
            <Container maxWidth="lg" key={surah.surah} sx={{ pt: 5 }}>
              <Typography
                variant="h4"
                //fontFamily={"alQalam"}
                component="h1"
                gutterBottom
                align="left"
              >
                {surahData[surah.surah - 1].englishName}
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
                        onClick={() =>
                          handleAyahSelection(currentJuzLocalIndex)
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
              <Divider />
            </Container>
          );
        })}
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
