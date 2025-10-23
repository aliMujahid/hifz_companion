import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import Container from "@mui/material/Container";
import Player from "../components/Player";
import AyahButton from "../components/AyahButton";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"; 
import data from "../../surahData.json"; 

// Dummy functions for Player props (replace with actual logic if needed)
const skipToPrevSurah = () => console.log("Skip to previous Surah");
const skipToNextSurah = () => console.log("Skip to next Surah");

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
        return { number: 0, name: "Error", englishName: "Error", englishNameTranslation: "Not Found", numberOfAyahs: 0, revelationType: "", firstAyahIndex: 0 };
    }, [surahNumber]);
   
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    // State to store the selected range: [startAyahNumber, endAyahNumber]
    const [selectedAyahRange, setSelectedAyahRange] = useState([null, null]);

    const togglePlayerVisibility = () => {
        setIsPlayerVisible(!isPlayerVisible);
    };

    // Determine the ordered start and end of the selection for display/play
    const [ayahNumberFirst, totalAyah] = useMemo(() => {
        const [start, end] = selectedAyahRange;
        if (start === null || end === null) return [null, 0];

        const minAyah = Math.min(start, end);
        const maxAyah = Math.max(start, end);
        const count = maxAyah - minAyah + 1;
        return [minAyah+surah.firstAyahIndex-1 , count];
    }, [selectedAyahRange]);

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


    // Create an array of ayah numbers for mapping (simplified)
    const ayahNumbers = Array.from({ length: surah.numberOfAyahs }, (_, i) => i + 1);

    return (
        <Box sx={{ p: 2, pb: isPlayerVisible ? 30 : 2 }}> 
            <Container maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom align="center">
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
                {/* Display selected range info */}
                <Typography variant="body1" mt={4} align="center">
                    {ayahNumberFirst !== null
                        ? `Selected Ayahs: ${ayahNumberFirst} to ${ayahNumberFirst + totalAyah - 1} (Total: ${totalAyah})`
                        : "Click an ayah to start a selection."
                    }
                </Typography>
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
                    borderTop: '1px solid #e0e0e0' // Optional styling
                }}
            >
                {/* Only render Player if a range is selected and totalAyah > 0 */}
                {ayahNumberFirst !== null && totalAyah > 0 && (
                    <Player
                        surahData={surah}
                        ayahNumberFirst={ayahNumberFirst}
                        totalAyah={totalAyah}
                        togglePlayerVisibility={togglePlayerVisibility}
                        skipToPrevSurah={skipToPrevSurah}
                        skipToNextSurah={skipToNextSurah}
                        // Note: The Player component will need the actual URLs for the selected range.
                        // You'll need to create this list of URLs based on ayahNumberFirst and totalAyah
                        // and pass it to the Player.
                    />
                )}
            </Box>
        </Box>
    );
}