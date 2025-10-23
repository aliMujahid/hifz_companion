import SurahInfoCard from "../components/SurahInfoCard";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import Typography from "@mui/material/Typography";
import Player from "../components/Player";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import data from "../../surahData.json";

const totalSurahs = 114;

export default function SurahPage() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const playerBoxRef = useRef(null);
  const playButtonRef = useRef(null);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [numberOfAyahs, setNumberOfAyahs] = useState(7);
  const [ayahNumberFirst, setAyahNumberFirst] = useState(0);
  const theme = useTheme();

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  useEffect(() => {
    // When the player becomes visible
    if (isPlayerVisible && playerBoxRef.current) {
      playerBoxRef.current.focus();
    }
    if (!isPlayerVisible && playButtonRef.current) {
      playButtonRef.current.focus();
    }
  }, [isPlayerVisible]);

  const handleSurahChange = (newSurahNumber) => {
    let finalSurahNumber = newSurahNumber;

    if (newSurahNumber < 1) {
      finalSurahNumber = totalSurahs; // Loop back to the last Surah
    } else if (newSurahNumber > totalSurahs) {
      finalSurahNumber = 1; // Loop back to the first Surah
    }
    setSelectedSurah(finalSurahNumber);

    const newSurahData = data[finalSurahNumber - 1];
    if (newSurahData) {
      setNumberOfAyahs(newSurahData.numberOfAyahs);
    }
  };

  const skipToPrevSurah = () => handleSurahChange(selectedSurah - 1);
  const skipToNextSurah = () => handleSurahChange(selectedSurah + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.alquran.cloud/v1/ayah/${selectedSurah}:1/ar.alafasy`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setAyahNumberFirst(result.data.number);
      } catch (e) {
        console.error("Fetch error:", e.message);
      }
    };
    fetchData();
  }, [selectedSurah]);

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          margin: "0 auto",
          mb: isPlayerVisible ? 60 : 2,
        }}
      >
        <Container>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Surah
          </Typography>

          {/* The Stack component for listing items */}

          <Grid
            container
            justifyContent="center"
            sx={{ width: "100%" }}
            spacing={1.5} // Controls the vertical space between each SurahRow card
            dir="rtl"
          >
            {data.map((surah) => (
              // We wrap the SurahRow in a key for performance and stability
              <SurahInfoCard
                onSurahCardClick={() => {
                  setSelectedSurah(surah.number);
                  setNumberOfAyahs(surah.numberOfAyahs);
                  setIsPlayerVisible(true);
                }}
                key={surah.number}
                surah={surah}
                selected={selectedSurah === surah.number}
              />
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Button to show the player if it's hidden */}
      {!isPlayerVisible && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <IconButton
            color="primary"
            onClick={togglePlayerVisibility}
            ref={playButtonRef}
            sx={{
              bgcolor: "background.paper",
              boxShadow: 5,
              "&:hover": { bgcolor: "primary.light" },
              "&:focus-visible": {
                outline: `4px solid ${theme.palette.primary.main}`, // Use a primary color outline
                outlineOffset: "2px", // Add space between button edge and outline
                boxShadow: theme.shadows[8], // Optionally increase shadow for distinction
              },
            }}
            aria-label="Show Audio Player"
          >
            <KeyboardDoubleArrowUpIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
      <Box
        ref={playerBoxRef}
        tabIndex={-1}
        sx={{
          position: "fixed",
          bottom: isPlayerVisible ? 0 : -500,
          left: 0,
          right: 0,
          zIndex: 1300,
          p: 1,
          width: "100%",
          transition: "bottom 0.3s ease-in-out",
          boxSizing: "border-box",
          pointerEvents: isPlayerVisible ? "auto" : "none",
          visibility: isPlayerVisible ? "visible" : "hidden",
        }}
      >
        {data && (
          <Player
            surahData={data[selectedSurah - 1]}
            togglePlayerVisibility={togglePlayerVisibility}
            ayahNumberFirst={ayahNumberFirst}
            totalAyah={numberOfAyahs}
            skipToPrevSurah={skipToPrevSurah}
            skipToNextSurah={skipToNextSurah}
          />
        )}
      </Box>
    </Box>
  );
}
