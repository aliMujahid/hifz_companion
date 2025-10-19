import CardContent from "@mui/material/CardContent";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RepeatIcon from "@mui/icons-material/Repeat";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Card from "@mui/material/Card";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState, useRef, useEffect, useCallback } from "react";

export default function Player({
  surahData,
  togglePlayerVisibility,
  ayahNumberFirst,
  totalAyah,
}) {
  const theme = useTheme();
  const audioSourceUrl = [
    "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
  ];

  for (let index = 0; index <= totalAyah; index++) {
    audioSourceUrl.push(
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
        ayahNumberFirst + index
      }.mp3`
    );
  }

  const [open, setOpen] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- Utility Functions (Kept from previous version) ---
  const goToNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % audioSourceUrl.length;
      return nextIndex;
    });
    setPaused(false);
  }, [audioSourceUrl.length]);

  const handleAudioEnd = useCallback(() => {
    if (paused) return;

    const nextRepeat = currentRepeat + 1;
    setCurrentRepeat(nextRepeat);

    if (nextRepeat < repeatCount) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio after loop:", e));
      }
    } else {
      const isLastTrack = currentTrackIndex === audioSourceUrl.length - 1;

      if (!isLastTrack) {
        setCurrentRepeat(0);
        goToNextTrack();
      } else {
        setPaused(true);
        setIsDone(true);
        setCurrentRepeat(0);
      }
    }
  }, [
    paused,
    currentRepeat,
    repeatCount,
    currentTrackIndex,
    audioSourceUrl.length,
    goToNextTrack,
  ]);

  useEffect(() => {
    setCurrentTrackIndex(0);
    setCurrentRepeat(0);
    setPaused(true);
    setIsDone(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [ayahNumberFirst]); // Trigger when a new Surah is selected

  const controllPlayPause = () => {
    const audio = audioRef.current;

    if (paused) {
      if (isDone) {
        setCurrentTrackIndex(0);
        setIsDone(false);
      }
      audio.play();
    } else {
      audio.pause();
    }

    setPaused(!paused);
    if (isDone) setIsDone(false);
  };

  const togglePlayer = () => {
    setOpen(!open);
  };

  const handleClick = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setRepeatCount(value);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleNextClick = () => {
    setCurrentRepeat(0);
    goToNextTrack();
  };

  const handlePrevClick = () => {
    setCurrentRepeat(0);
    setCurrentTrackIndex((prevIndex) => {
      const newIndex =
        (prevIndex - 1 + audioSourceUrl.length) % audioSourceUrl.length;
      return newIndex;
    });
    setPaused(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", handleAudioEnd);
      return () => {
        audio.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, [handleAudioEnd]);

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        setDuration(0);
      }
      setCurrentTime(audio.currentTime);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", updateTime);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!paused) {
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing after track change:", e));
      }
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [currentTrackIndex, paused]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "768px",
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          boxShadow: theme.shadows[10],
          backgroundColor: theme.palette.background.paper,
          position: "relative",
        }}
      >
        <IconButton
          aria-label="close"
          onClick={togglePlayerVisibility}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1, // Ensure it's above the card content
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "row",
              sm: "column",
            },
            width: {
              xs: "100%",
              sm: "25%",
            },
            height: "auto",
            flexShrink: 0,
            backgroundImage:
              "linear-gradient(135deg, #00C4AA 0%, #00A152 100%)",

            alignItems: "center",
            justifyContent: "center",
            borderRadius: "3px 0 0 3px",
          }}
        >
          <Typography
            variant="h6"
            color="white"
            sx={{ p: 2, textAlign: "center" }}
          >
            {surahData.englishName}
          </Typography>

          <Typography
            variant="h6"
            color="white"
            sx={{ p: 2, textAlign: "center", fontFamily: "AlQalam" }}
            dir="rtl"
          >
            {surahData.name}
          </Typography>
          <Typography
            variant="h6"
            color="white"
            sx={{ p: 2, textAlign: "center" }}
          >
            {surahData.number}
          </Typography>
        </Box>

        {/* Right Side: Player Controls and Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          <CardContent
            sx={{
              flex: "1 0 auto",
              p: 0,
              pb: 1,
              "&:last-child": { pb: 1 },
            }}
          >
            <Typography component="div" variant="h6">
              Ayah {currentTrackIndex}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              Mishary Alafasy
            </Typography>
          </CardContent>

          {/* Repeat Controls */}
          <Box
            sx={{
              maxWidth: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              flexDirection: "row",
              mb: 2,
            }}
          >
            <RepeatIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="body2" sx={{ mr: 1 }}>
              Set Repeats:
            </Typography>
            {[1, 3, 5, 10].map((count) => (
              <Button
                key={count}
                variant={repeatCount === count ? "contained" : "outlined"}
                value={count}
                onClick={handleClick}
                size="small"
              >
                {count}
              </Button>
            ))}
            <TextField
              type="number"
              size="small"
              sx={{ width: 60 }}
              value={repeatCount}
              onChange={(e) =>
                setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </Box>

          {/* Progress Bar and Time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="caption" sx={{ minWidth: 35 }}>
              {formatTime(currentTime)}
            </Typography>

            <Slider
              min={0}
              max={duration || 0}
              value={currentTime}
              onChangeCommitted={(event, newValue) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = newValue;
                  setCurrentTime(newValue);
                }
              }}
              aria-label="Audio progress"
              color="primary"
              sx={{
                flexGrow: 1,
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                  transition: "0.2s",
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(0,0,0,0.16)",
                  },
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{ minWidth: 35, textAlign: "right" }}
            >
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Player Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loop:{" "}
              <span style={{ fontWeight: "bold" }}>
                {currentRepeat}/{repeatCount}
              </span>
            </Typography>

            <Box>
              <IconButton aria-label="previous" onClick={handlePrevClick}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton
                aria-label="play/pause"
                onClick={controllPlayPause}
                sx={{ mx: 1 }}
              >
                {paused ? (
                  <PlayArrowIcon
                    sx={{
                      height: 38,
                      width: 38,
                      color: theme.palette.primary.main,
                    }}
                  />
                ) : (
                  <PauseIcon
                    sx={{
                      height: 38,
                      width: 38,
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
              </IconButton>
              <IconButton aria-label="next" onClick={handleNextClick}>
                <SkipNextIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
      </Card>
    </Box>
  );
}
