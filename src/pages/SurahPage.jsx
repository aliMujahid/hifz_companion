import SurahInfoCard from "../components/SurahInfoCard";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import Typography from "@mui/material/Typography";
import Player from "../components/Player";
import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
// Example Data (extended for the list)

export default function SurahPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (e) {
        console.error("Fetch error:", e.message);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const [selectedSurah, setSelectedSurah] = useState(1);
  const [numberOfAyahs, setNumberOfAyahs] = useState(7);
  const [ayahNumberFirst, setAyahNumberFirst] = useState(0);
  const [isSurahLoading, setIsSurahLoading] = useState(true);
  const [errorSurah, setErrorSurah] = useState(null);
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
        setErrorSurah(e);
      } finally {
        setIsSurahLoading(false);
      }
    };
    fetchData();
  }, [selectedSurah]);

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          maxWidth: 500,
          margin: "0 auto",
          mb: isPlayerVisible ? 50 : 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Surah
        </Typography>

        {/* The Stack component for listing items */}
        {isLoading ? (
          <>
            <CircularProgress color="primary" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading Surahs...
            </Typography>
          </>
        ) : (
          <Stack
            spacing={1.5} // Controls the vertical space between each SurahRow card
            sx={{ mt: 2 }}
          >
            {data.map((surah) => (
              // We wrap the SurahRow in a key for performance and stability
              <SurahInfoCard
                onSurahCardClick={() => {
                  setSelectedSurah(surah.number);
                  setNumberOfAyahs(surah.numberOfAyahs);
                }}
                key={surah.number}
                surah={surah}
              />
            ))}
          </Stack>
        )}
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
            sx={{
              bgcolor: "background.paper",
              boxShadow: 5,
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            <PlayCircleFilledIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
      <Box
        sx={{
          position: "fixed",
          bottom: isPlayerVisible ? 0 : -500,
          left: 0,
          right: 0,
          zIndex: 1300,
          p: 1,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {data && (
          <Player
            surahData={data[selectedSurah - 1]}
            togglePlayerVisibility={togglePlayerVisibility}
            ayahNumberFirst={ayahNumberFirst}
            totalAyah={numberOfAyahs}
          />
        )}
      </Box>
    </Box>
  );
}
