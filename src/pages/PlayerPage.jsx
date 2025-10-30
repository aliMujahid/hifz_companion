import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect} from "react";

import AyahText from "../components/AyahText";
import Player from "../components/Player";



export default function PlayerPage() {


  const [ayahNumberFirst, setAyahNumberFirst] = useState(null);
  const [ayahList, setAyahList] = useState([])

  const [showText, setShowText] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Parse and validate parameters
    const start = parseInt(params.get("start"), 10) || 1;
    const ayaat = params.get("ayaat")?.split(",").map(i=>parseInt(i, 10)) || [];
    

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
      {showText && (
        <AyahText ayahNumberFirst={ayahNumberFirst} ayahList={ayahList} currentAyahTextIndex={currentTrackIndex} />
      )}
      <Player ayahNumberFirst={ayahNumberFirst} ayahList={ayahList} setPlayerPageCurrentTrackIndex={setCurrentTrackIndex} showText={showText} toggleShowText={toggleShowText} />
    </>
  );
}
