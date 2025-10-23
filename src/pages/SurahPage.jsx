import SurahInfoCard from "../components/SurahInfoCard";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import data from "../../surahData.json";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function SurahPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    // Removed all player-related state, refs, and effects.
    // Functions like skipToPrevSurah, skipToNextSurah, handleSurahChange are also removed.

    const handleSurahClick = (surahNumber) => {
        // Navigate to the detail page for the clicked surah
        navigate(`/surah/${surahNumber}`);
    };

    return (
        <Box>
            <Box
                sx={{
                    p: 2,
                    margin: "0 auto",
                    mb: 2, // Simplified margin
                }}
            >
                <Container>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Surah List
                    </Typography>

                    <Grid
                        container
                        justifyContent="center"
                        sx={{ width: "100%" }}
                        spacing={1.5}
                        dir="rtl"
                    >
                        {data.map((surah) => (
                            <Grid item key={surah.number}>
                                <SurahInfoCard
                                    // Modified onSurahCardClick to use the new navigation function
                                    onSurahCardClick={() => handleSurahClick(surah.number)}
                                    surah={surah}
                                    // The 'selected' prop is no longer needed on the list page
                                    // since there's no player to highlight a card.
                                    // We pass 'false' or simply omit it (assuming a default value)
                                    selected={false}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Removed the fixed player UI and the visibility button */}
        </Box>
    );
}