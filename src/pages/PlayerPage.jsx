import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import AyahText from "../components/AyahText";
import Player from "../components/Player";
import { useNavigate } from "react-router-dom";

export default function PlayerPage() {
  const navigate = useNavigate();
  const [ayahNumberFirst, setAyahNumberFirst] = useState(null);
  const [ayahList, setAyahList] = useState([]);

  const [showText, setShowText] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Parse and validate parameters
    const start = parseInt(params.get("start"), 10) || 1;
    const ayaat =
      params
        .get("ayaat")
        ?.split(",")
        .map((i) => parseInt(i, 10)) || [];

    setAyahNumberFirst(start);
    setAyahList(ayaat);
  }, []);

  const toggleShowText = () => {
    setShowText(!showText);
  };

  // Display a loading message until parameters are parsed and the audio list is generated
  if (ayahNumberFirst === null) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Loading playback settings...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Box
          sx={{
            position: "sticky",
            top: 16,
            alignSelf: "flex-start",
            flexShrink: 0,
            pl: 1, // Add some padding so it's not on the edge
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        {showText && (
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <AyahText
              ayahNumberFirst={ayahNumberFirst}
              ayahList={ayahList}
              currentAyahTextIndex={currentTrackIndex}
            />
          </Box>
        )}
      </Box>
      <Player
        ayahNumberFirst={ayahNumberFirst}
        ayahList={ayahList}
        setPlayerPageCurrentTrackIndex={setCurrentTrackIndex}
        showText={showText}
        toggleShowText={toggleShowText}
      />
    </>
  );
}
