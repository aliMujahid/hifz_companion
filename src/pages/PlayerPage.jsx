import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect} from "react";

import AyahText from "../components/AyahText";
import Player from "../components/Player";



export default function PlayerPage() {


  const [ayahNumberFirst, setAyahNumberFirst] = useState(null);
  const [totalAyah, setTotalAyah] = useState(0);

  const [showText, setShowText] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Parse and validate parameters
    const start = parseInt(params.get("start"), 10) || 1;
    const count = parseInt(params.get("count"), 10) || 1;
    const show = params.get("show") === "true";

    setAyahNumberFirst(start);
    setTotalAyah(count);
    setShowText(show);
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
      {showText && (
        <AyahText ayahNumberFirst={ayahNumberFirst} totalAyah={totalAyah} currentAyahTextIndex={currentTrackIndex} />
      )}
      <Player ayahNumberFirst={ayahNumberFirst} totalAyah={totalAyah} setPlayerPageCurrentTrackIndex={setCurrentTrackIndex} showText={showText} toggleShowText={toggleShowText} />
    </>
  );
}
