const JUZ = [
  { ayahNumberFirst: 1, totalAyahs: 148 },
  { ayahNumberFirst: 149, totalAyahs: 111 },
  { ayahNumberFirst: 260, totalAyahs: 126 },
  { ayahNumberFirst: 386, totalAyahs: 131 },
  { ayahNumberFirst: 517, totalAyahs: 124 },
  { ayahNumberFirst: 641, totalAyahs: 110 },
  { ayahNumberFirst: 751, totalAyahs: 149 },
  { ayahNumberFirst: 900, totalAyahs: 142 },
  { ayahNumberFirst: 1042, totalAyahs: 159 },
  { ayahNumberFirst: 1201, totalAyahs: 127 },
  { ayahNumberFirst: 1328, totalAyahs: 151 },
  { ayahNumberFirst: 1479, totalAyahs: 170 },
  { ayahNumberFirst: 1649, totalAyahs: 154 },
  { ayahNumberFirst: 1803, totalAyahs: 227 },
  { ayahNumberFirst: 2030, totalAyahs: 185 },
  { ayahNumberFirst: 2215, totalAyahs: 269 },
  { ayahNumberFirst: 2484, totalAyahs: 190 },
  { ayahNumberFirst: 2674, totalAyahs: 202 },
  { ayahNumberFirst: 2876, totalAyahs: 339 },
  { ayahNumberFirst: 3215, totalAyahs: 171 },
  { ayahNumberFirst: 3386, totalAyahs: 178 },
  { ayahNumberFirst: 3564, totalAyahs: 169 },
  { ayahNumberFirst: 3733, totalAyahs: 357 },
  { ayahNumberFirst: 4090, totalAyahs: 175 },
  { ayahNumberFirst: 4265, totalAyahs: 246 },
  { ayahNumberFirst: 4511, totalAyahs: 195 },
  { ayahNumberFirst: 4706, totalAyahs: 399 },
  { ayahNumberFirst: 5105, totalAyahs: 137 },
  { ayahNumberFirst: 5242, totalAyahs: 431 },
  { ayahNumberFirst: 5673, totalAyahs: 564 },
];

const totalJuzs = 30 - 1; //offset by -1 for indexing

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import Container from "@mui/material/Container";
import { useEffect, useState } from "react";
import Player from "../components/Player";
import { useTheme } from "@mui/material/styles";

export default function JuzPage() {
  const [selectedJuz, setSelectedJuz] = useState(0);
  const [numberOfAyahs, setNumberOfAyahs] = useState(JUZ[0].totalAyahs);
  const [ayahNumberFirst, setAyahNumberFirst] = useState(
    JUZ[0].ayahNumberFirst
  );
  const [juzData, setJuzdata] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const theme = useTheme();

  const handleJuzChange = (newJuzNumber) => {
    let finalJuzNumber = newJuzNumber;

    if (newJuzNumber < 0) {
      finalJuzNumber = totalJuzs; // Loop back to the last Juz
    } else if (newJuzNumber > totalJuzs) {
      finalJuzNumber = 0; // Loop back to the first Juz
    }
    setSelectedJuz(finalJuzNumber);

    const newJuzData = JUZ[finalJuzNumber];
    if (newJuzData) {
      setAyahNumberFirst(newJuzData.ayahNumberFirst);
      setNumberOfAyahs(newJuzData.totalAyahs);
    }
  };

  const skipToPrevJuz = () => handleJuzChange(selectedJuz - 1);
  const skipToNextJuz = () => handleJuzChange(selectedJuz + 1);

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  useEffect(() => {
    // Only fetch if a Juz is selected (selectedJuz is not null) and ayahNumberFirst is not 0
    if (selectedJuz !== null && ayahNumberFirst !== 0) {
      const fetchFirstAyahText = async (ayahNumberFirst) => {
        try {
          const response = await fetch(
            `https://api.alquran.cloud/v1/ayah/${ayahNumberFirst}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          const juzData = {
            number: selectedJuz + 1,
            englishName: `Para`,
            englishNameTranslation: "",
            // Use 'Alif Lam Mim' for the first Juz (index 0)
            name:
              selectedJuz === 0
                ? "الٓمّٓ"
                : truncateAtSecondWord(result.data.text),
          };
          setJuzdata(juzData);
        } catch (e) {
          console.error("Fetch error:", e.message);
        }
      };
      fetchFirstAyahText(ayahNumberFirst);
    }
  }, [selectedJuz]);

  function removeBismilla(str) {
    const bsmlla = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ ";
    if (str.startsWith(bsmlla)) {
      return str.substring(bsmlla.length);
    } else {
      return str;
    }
  }

  function truncateAtSecondWord(str) {
    str = removeBismilla(str);
    const words = str.split(" ");
    if (words.length <= 2) {
      return str;
    }
    return words[1] + " " + words[2];
  }

  return (
    <Box sx={{ p: 2, pb: isPlayerVisible ? 60 : 2 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Juz (Para)
        </Typography>

        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ width: "100%" }}
        >
          {JUZ.map((juz, index) => {
            const isSelected = selectedJuz === index;
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: theme.spacing(1.5),
                  borderRadius: theme.shape.borderRadius,
                  p: 1,
                  border: `1px solid ${
                    isSelected
                      ? theme.palette.primary.main
                      : theme.palette.divider
                  }`,
                  backgroundColor: isSelected
                    ? theme.palette.primary.light + "1a"
                    : theme.palette.background.paper, // Subtle background for selected
                  boxShadow: isSelected ? theme.shadows[2] : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                key={index}
                selected={isSelected}
                onClick={() => {
                  setSelectedJuz(index);
                  setAyahNumberFirst(juz.ayahNumberFirst);
                  setNumberOfAyahs(juz.totalAyahs);
                  if (!isPlayerVisible) {
                    setIsPlayerVisible(true);
                  }
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    minWidth: 50,
                    height: "auto",
                    borderRadius: theme.shape.borderRadius,

                    background: isSelected
                      ? theme.palette.primary.main
                      : "linear-gradient(45deg, #1fae7e, #49c488)", // Specific gradient for unselected state
                    color: theme.palette.common.white,
                    fontWeight: "bold",

                    boxShadow: theme.shadows[1],
                  }}
                >
                  <Typography variant="h4">{index + 1}</Typography>
                </Box>
              </Box>
            );
          })}
        </Grid>
      </Container>

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
            <KeyboardDoubleArrowUpIcon fontSize="large" />
          </IconButton>
        </Box>
      )}

      {/* Player component fixed at the bottom */}
      {juzData && (
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
            transition: "bottom 0.3s ease-in-out",
          }}
        >
          <Player
            surahData={juzData}
            ayahNumberFirst={ayahNumberFirst}
            totalAyah={numberOfAyahs}
            togglePlayerVisibility={togglePlayerVisibility}
            skipToPrevSurah={skipToPrevJuz}
            skipToNextSurah={skipToNextJuz}
          />
        </Box>
      )}
    </Box>
  );
}
