import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Player from "../components/Player";
import AyahButton from "../components/AyahButton";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import data from "../../juzData.json";
import AYAH_TEXT from "../../indopak-nastaleeq-vers.json";
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
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);


  // Determine the ordered start and end of the selection for display/play
  const [ayahStartIndex, totalAyah] = useMemo(() => {
    const [start, end] = selectedAyahRange;
    if (start === null || end === null) return [null, 0];

    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);
    const count = maxAyah - minAyah + 1;
    return [minAyah, count];
  }, [selectedAyahRange]);

  // Calculate the global index of the first ayah for the Player component
  // Assuming `juz.firstAyahIndex` is the global index of the first ayah of the juz.
  const ayahNumberFirstGlobal = useMemo(() => {
    if (ayahStartIndex === null) return null;
    // Calculate the global ayah index (1-based global ayah number)
    return juz.firstAyahIndex + ayahStartIndex - 1;
  }, [juz.firstAyahIndex, ayahStartIndex]);

  // Logic to fetch the Ayah Texts based on the selection
  const ayahTexts = useMemo(() => {
    if (ayahStartIndex === null || totalAyah === 0 || juz.number === 0)
      return [];

    const texts = [];
    for (let i = 0; i < totalAyah; i++) {
      
      const ayahKey = ayahNumberFirstGlobal + i;
      if (AYAH_TEXT[ayahKey]) {
        texts.push(AYAH_TEXT[ayahKey]);
      }
    }
    return texts;
  }, [ayahStartIndex, totalAyah, juz.number]);

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
    const [start, end] = selectedAyahRange;

    if (start === null) {
      // First click: Set the start
      setSelectedAyahRange([ayahNumber, null]);
    } else if (end === null) {
      // Second click: Set the end and finalize the range
      setSelectedAyahRange([start, ayahNumber]);
      // Optionally show player immediately after selection
      if (!isPlayerVisible) {
        setIsPlayerVisible(true);
      }
    } else {
      // Third click (or beyond): Start a new selection
      // We set the new start and clear the end
      setSelectedAyahRange([ayahNumber, null]);
    }
  };

  // Checks if an ayah number is within the selected range (inclusive)
  const isAyahSelected = (ayahNumber) => {
    const [start, end] = selectedAyahRange;

    if (start === null) return false;

    // If only start is selected
    if (end === null) return ayahNumber === start;

    // If a full range is selected
    const minAyah = Math.min(start, end);
    const maxAyah = Math.max(start, end);

    return ayahNumber >= minAyah && ayahNumber <= maxAyah;
  };

  const currentJuzSurahs = surahInJuz[juzNumber - 1] 
 ? surahInJuz[juzNumber - 1].surahs 
: [];


 let juzLocalAyahIndex = 1;

  return (
    <Box sx={{ p: 2, pb: isPlayerVisible ? 30 : 2 }}>
      <Typography
          variant="h4"
          fontFamily={"alQalam"}
          component="h1"
          gutterBottom
          align="center"
        >
          {juz.name}
        </Typography>
{
    currentJuzSurahs.map((surah)=>{
        return       <Container maxWidth="md"> 
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
          {surah.ayahs.map((ayah) => { 

            const currentJuzLocalIndex = juzLocalAyahIndex;
                
            juzLocalAyahIndex++;

            return <Grid item key={`${surah.surah}:${ayah}`}>
              <AyahButton
                ayah={ayah}
                isSelected={isAyahSelected(currentJuzLocalIndex)}
                onClick={() => handleAyahSelection(currentJuzLocalIndex)}
              />
            </Grid>
          })}
        </Grid>
      </Container>
    })
}

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

      {/* Player component fixed at the bottom */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          p: 1,
          width: "100%",
          boxSizing: "border-box",
          transition: "bottom 0.3s ease-in-out",
          borderTop: "1px solid #e0e0e0", // Optional styling
        }}
      >
        {/* Only render Player if a range is selected and totalAyah > 0 */}
        {ayahNumberFirstGlobal !== null && totalAyah > 0 && (
          <Player
            ayahNumberFirst={ayahNumberFirstGlobal} // Pass the global index
            totalAyah={totalAyah}
          />
        )}
      </Box>

      {/* -------------------- RIGHT DRAWER FOR AYAH TEXTS -------------------- */}
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
            <Typography variant="h6">
              juz {juz.englishName} ({ayahStartIndex} -{" "}
              {ayahStartIndex + totalAyah - 1})
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4" mr={3} dir="rtl" fontFamily={"alQalam"}>
              {juz.name}
              </Typography>
              <IconButton
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close text drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />

          {/* Display the Ayah Texts */}
          <Box sx={{ mt: 2, height: "calc(100vh - 100px)", overflowY: "auto" }}>
            {ayahTexts.length > 0 ? (
              ayahTexts.map((ayah, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography
                    dir="rtl"
                    variant="body1"
                    sx={{
                      fontFamily:
                        "AlQalam, 'Arial Unicode MS', Arial, sans-serif",
                      fontSize: "1.8rem",
                      lineHeight: 2.2,
                      fontWeight: 500,
                    }}
                  >
                    {ayah.text}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a range of Ayahs to view the text.
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
      {/* ------------------ END RIGHT DRAWER ------------------ */}
    </Box>
  );
}


