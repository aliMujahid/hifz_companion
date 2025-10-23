import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RepeatIcon from "@mui/icons-material/Repeat";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Card from "@mui/material/Card";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import { useState, useRef, useEffect, useCallback } from "react";
import RepeatCountField from "./playerComponents/RepeatCountField";
import DATA from "../../surahData.json";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

export default function Player({ surahData, ayahNumberFirst, totalAyah }) {
  const theme = useTheme();
  const audioSourceUrl = [];

  let surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);

  let index = 0;
  if (ayahNumberFirst == 1) {
    index++;
  } // bismillah is already in the source list

  for (index; index < totalAyah; index++) {
    if (
      surahFirstAyahNumberList.includes(ayahNumberFirst + index) &&
      ayahNumberFirst + index !== 1236
    ) {
      //omit bismillas beefore surah tawba
      audioSourceUrl.push(
        "https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/1.mp3"
      );
    }
    audioSourceUrl.push(
      `https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/${
        ayahNumberFirst + index
      }.mp3`
    );
  }

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [pauseTime, setPauseTime] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [loop, setLoop] = useState(false);
  const audioRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleLoop = () => {
    setLoop(!loop);
  };
  const goToNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % audioSourceUrl.length;
      return nextIndex;
    });
    setPaused(false);
  }, [audioSourceUrl.length]);

  const handleAudioEnd = useCallback(() => {
    if (paused) return;
    if (currentTrackIndex === 0) {
      goToNextTrack();
      return;
    }

    const nextRepeat = currentRepeat + 1;
    setCurrentRepeat(nextRepeat);

    if (nextRepeat < repeatCount) {
      if (pauseTime) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) =>
                console.error("Error playing audio after loop:", e)
              );
          }
        }, duration * 1000);
      } else {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .catch((e) => console.error("Error playing audio after loop:", e));
        }
      }
    } else {
      const isLastTrack = currentTrackIndex === audioSourceUrl.length - 1;

      if (!isLastTrack) {
        setCurrentRepeat(0);
        if (pauseTime) {
          setTimeout(() => {
            goToNextTrack();
          }, duration * 1000);
        } else {
          goToNextTrack();
        }
      } else {
        if (loop) {
          if (pauseTime) {
            setTimeout(() => {
              goToNextTrack();
            }, duration * 1000);
          } else {
            goToNextTrack();
          }
        } else {
          setPaused(true);
          setIsDone(true);
        }
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
    loop,
    pauseTime,
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
  }, [currentTrackIndex]);

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.paper,
          position: "relative",
          px: { xs: 1, sm: 2, md: 5 },
          pt: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            px: 2,
            py: 0,
          }}
        >
          {/* Repeat Controls */}
          {isExpanded && (
            <>
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
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Set Repeats:
                </Typography>
                {[1, 2, 3, 4, 5, 6, 7].map((count) => (
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

                <Box
                  sx={{
                    maxWidth: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    flexDirection: "row",
                    ml: 5,
                  }}
                >
                  <Button
                    variant={pauseTime ? "contained" : "outlined"}
                    onClick={() => setPauseTime(!pauseTime)}
                    size="small"
                  >
                    Pause Between Ayah
                  </Button>
                </Box>
              </Box>
            </>
          )}
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
            <IconButton
              aria-label={isExpanded ? "Collapse Controls" : "Expand Controls"}
              onClick={toggleExpanded}
              size="small"
            >
              {isExpanded ? (
                <KeyboardDoubleArrowDownIcon fontSize="small" />
              ) : (
                <KeyboardDoubleArrowUpIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          {/* Player Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 0, sm: 1, md: 3, lg: 5 },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Repeat:{" "}
              <span style={{ fontWeight: "bold" }}>
                {currentRepeat + 1}/{repeatCount}
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
            <IconButton
              onClick={toggleLoop}
              aria-label="Toggle playlist loop"
              color={loop ? "primary" : "inherit"}
              sx={{
                border: loop
                  ? `2px solid ${theme.palette.primary.main}`
                  : "2px solid transparent",
                borderRadius: "50%",
                p: "8px",
                transition: "border 0.2s",
              }}
            >
              <RepeatIcon />
            </IconButton>
          </Box>
        </Box>

        <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
      </Card>
    </Box>
  );
}
