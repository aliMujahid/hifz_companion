import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom"; 
import { useState} from "react";
import SurahInfoCard from "../components/SurahInfoCard";
import { useTheme } from "@mui/material/styles";
import data from "../../juzData.json";




export default function JuzPage() {


  const navigate = useNavigate();

    const handleJuzClick = (juzNumber) => {
        // Navigate to the detail page for the clicked juz
        navigate(`/juz/${juzNumber}`);
    };

    const theme = useTheme();
 


  return (
    <Box sx={{ p: 2, pb: 30 }}>
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
          {data.map((juz) => {
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: theme.spacing(1.5),
                  borderRadius: theme.shape.borderRadius,
                  p: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper, 
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                key={juz.number}
                
                onClick={()=>{
                  handleJuzClick(juz.number)
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

                    background: "linear-gradient(45deg, #1fae7e, #49c488)", // Specific gradient for unselected state
                    color: theme.palette.common.white,
                    fontWeight: "bold",

                    boxShadow: theme.shadows[1],
                  }}
                >
                  <Typography variant="h4">{juz.number}</Typography>
                </Box>
              </Box>
            );
          })}
        </Grid>
      </Container>
    </Box>
    
  );
}
