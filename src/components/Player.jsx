import CardContent from "@mui/material/CardContent";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CardMedia from "@mui/material/CardMedia";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Card from "@mui/material/Card";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import { useState, useRef, useEffect } from "react";

export default function Player() {
  const audioSourceUrl =
    "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3";

  const [paused, setPaused] = useState(true);
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    // Attach event listeners
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", updateTime);

    // Clean up event listeners when the component unmounts
    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [audioSourceUrl]); // Rerun if the audio source changes

  const controllPlayPause = () => {
    const audio = audioRef.current;

    if (paused) {
      audio.play();
    } else {
      audio.pause();
    }

    setPaused(!paused);
  };

  // Function to format seconds into a readable MM:SS string
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div style={{}}>
      <h4>How to create Music Player UI in ReactJS?</h4>
      <Card
        style={{
          width: "80%",
          display: "flex",
          backgroundColor: "whitesmoke",
          boxShadow: "4px 4px 4px gray",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
            width: "100%",
            padding: "1rem",
          }}
        >
          <CardContent
            style={{
              flex: "1 0 auto",
            }}
          >
            <Typography component="h5" variant="h5">
              Music Title
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Singer Name
            </Typography>
          </CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Current Time Display */}
            <div>{formatTime(currentTime)}</div>

            {/* Progress Slider */}
            <Slider
              min={0}
              max={duration || 0} // Use 0 if duration isn't loaded yet
              value={currentTime}
              onChange={(event, newValue) => {
                // User is dragging the slider, but don't *set* the audio time yet.
                // You might want a separate state for a "dragged" value if you want
                // to update the displayed time while dragging without affecting the audio.
              }}
              onChangeCommitted={(event, newValue) => {
                // User let go of the slider, now update the audio's currentTime
                if (audioRef.current) {
                  audioRef.current.currentTime = newValue;
                  setCurrentTime(newValue); // Update component state as well
                }
              }}
              aria-label="Audio progress"
              sx={{ flexGrow: 1 }}
            />

            {/* Duration Display */}
            <div>{formatTime(duration)}</div>
          </Box>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: 1,
              paddingBottom: 1,
            }}
          >
            <IconButton aria-label="previous">
              {useTheme().direction !== "rtl" ? (
                <SkipPreviousIcon />
              ) : (
                <SkipNextIcon />
              )}
            </IconButton>
            <IconButton aria-label="play/pause">
              {paused ? (
                <PlayArrowIcon
                  style={{
                    height: 38,
                    width: 38,
                  }}
                  onClick={controllPlayPause}
                />
              ) : (
                <PauseIcon
                  style={{
                    height: 38,
                    width: 38,
                  }}
                  onClick={controllPlayPause}
                />
              )}
            </IconButton>
            <IconButton aria-label="next">
              {useTheme().direction !== "rtl" ? (
                <SkipNextIcon />
              ) : (
                <SkipPreviousIcon />
              )}
            </IconButton>
          </div>
        </div>

        <audio ref={audioRef} className="audio-element">
          <source src={audioSourceUrl}></source>
        </audio>
      </Card>
    </div>
  );
}
