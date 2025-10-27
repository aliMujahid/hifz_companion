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
import { useState, useRef, useEffect, useCallback, useMemo } from "react"; // Added useMemo

import DATA from "../../surahData.json";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

// Component now accepts no props, as settings come from the URL
export default function PlayerPage() {
  const theme = useTheme();

  // 1. STATE FOR URL-BASED PLAYBACK SETTINGS
  const [ayahNumberFirst, setAyahNumberFirst] = useState(null);
  const [totalAyah, setTotalAyah] = useState(0);
  const [gapSeconds, setGapSeconds] = useState(0); // Corresponds to `pauseTime` logic

  // Repetition is now initialized from the URL
  const [repeatCount, setRepeatCount] = useState(1);
  // Show Text setting (though not used in player logic, useful for state tracking)
  // const [showText, setShowText] = useState(true);

  // 2. EXTRACT SETTINGS FROM URL ONCE
  useEffect(() => {
    // Get the query string from the window's location
    const params = new URLSearchParams(window.location.search);

    // Parse and validate parameters
    const start = parseInt(params.get("start"), 10) || 1;
    const count = parseInt(params.get("count"), 10) || 1;
    const rep = parseInt(params.get("rep"), 10) || 1;
    const gap = parseFloat(params.get("gap")) || 0;
    // const show = params.get('show') === 'true'; // If needed for the text display logic

    setAyahNumberFirst(start);
    setTotalAyah(count);
    setRepeatCount(rep);
    setGapSeconds(gap);
    // setShowText(show);
  }, []); // Run once on mount

  // 3. MEMOIZE THE AUDIO SOURCE URL LIST GENERATION
  const audioSourceUrl = useMemo(() => {
    // Wait until URL parameters are parsed
    if (ayahNumberFirst === null || totalAyah === 0) return [];

    const urls = [];
    const surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);

    for (let i = 0; i < totalAyah; i++) {
      const currentGlobalAyah = ayahNumberFirst + i;

      // Check if the current ayah is the start of a new surah (and not Surah Tawba's start)
      // Global Ayah 1 (Al-Fatiha 1) is handled by the Bismillah in the first iteration
      // Global Ayah 1236 is the start of Surah Tawbah (Ayah 1), which has no Bismillah
      if (
        surahFirstAyahNumberList.includes(currentGlobalAyah) &&
        currentGlobalAyah !== 1
      ) {
        if (currentGlobalAyah !== 1236) {
          // Omit Bismillah before Surah 9 (Tawbah)
          urls.push(
            "https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/1.mp3"
          );
        }
      }

      // Add the actual ayah track
      urls.push(
        `https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/${currentGlobalAyah}.mp3`
      );
    }

    return urls;
  }, [ayahNumberFirst, totalAyah]); // Regenerate when start/count changes

  // ... (Existing state variables remain, with repeatCount initialized above)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
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

  // Use audioSourceUrl.length as a dependency
  const goToNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % audioSourceUrl.length;
      return nextIndex;
    });
    setPaused(false);
  }, [audioSourceUrl.length]);

  const handleAudioEnd = useCallback(() => {
    // Don't run if the audio was paused (e.g., user clicked pause button)
    if (paused) return;

    // Check if the source list is empty
    if (audioSourceUrl.length === 0) return;

    // The gap in seconds logic (previously implemented via `pauseTime`)
    const delay = gapSeconds * 1000;
    const shouldDelay = gapSeconds > 0;

    const nextRepeat = currentRepeat + 1;
    setCurrentRepeat(nextRepeat);

    if (nextRepeat < repeatCount) {
      // Repeat current ayah/track
      const startNextRepeat = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .catch((e) =>
              console.error("Error playing audio after repeat:", e)
            );
        }
      };

      if (shouldDelay) {
        setTimeout(startNextRepeat, delay);
      } else {
        startNextRepeat();
      }
    } else {
      // Finished repetition, move to next track
      const isLastTrack = currentTrackIndex === audioSourceUrl.length - 1;

      const advanceTrack = () => {
        setCurrentRepeat(0); // Reset repeat counter for the new ayah
        if (!isLastTrack) {
          goToNextTrack();
        } else if (loop) {
          // Loop the entire selection
          goToNextTrack();
        } else {
          // Done with the entire list
          setPaused(true);
          setIsDone(true);
        }
      };

      if (shouldDelay) {
        setTimeout(advanceTrack, delay);
      } else {
        advanceTrack();
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
    gapSeconds, // Use gapSeconds for delay
  ]);

  // Handle player reset when start Ayah changes (only runs once on initial load due to `useEffect` above)
  useEffect(() => {
    setCurrentTrackIndex(0);
    setCurrentRepeat(0);
    setPaused(true);
    setIsDone(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [ayahNumberFirst]);

  const controllPlayPause = () => {
    const audio = audioRef.current;

    // Prevent play if the audio list is empty
    if (audioSourceUrl.length === 0) return;

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

    if (!audio) {
      return;
    }

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
      // Only attempt to play if audioSourceUrl is populated and not paused
      if (!paused && audioSourceUrl.length > 0) {
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing after track change:", e));
      }
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [currentTrackIndex, paused, audioSourceUrl.length]); // Added dependencies

  // Display a loading message until parameters are parsed and the audio list is generated
  if (ayahNumberFirst === null) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Loading playback settings...</Typography>
      </Box>
    );
  }

  // If the ayah list is empty (e.g., invalid start/count)
  if (audioSourceUrl.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">No Ayahs selected for playback.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed", // Keep the player visible
        bottom: 0,
        left: 0,
        zIndex: 1300,
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
                  {/* Removed the Button for Pause Between Ayah, as it's now driven by gapSeconds from URL */}
                  {/* Displaying gapSeconds state value */}
                  <Typography variant="body2" sx={{ alignSelf: "center" }}>
                    **Gap:** {gapSeconds}s
                  </Typography>
                </Box>
              </Box>
            </>
          )}
          {/* Progress Bar and Time */}
          {/* ... (rest of the component structure remains the same) */}
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
              <IconButton
                aria-label="previous"
                onClick={handlePrevClick}
                disabled={audioSourceUrl.length === 0}
              >
                <SkipPreviousIcon />
              </IconButton>
              <IconButton
                aria-label="play/pause"
                onClick={controllPlayPause}
                sx={{ mx: 1 }}
                disabled={audioSourceUrl.length === 0}
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
              <IconButton
                aria-label="next"
                onClick={handleNextClick}
                disabled={audioSourceUrl.length === 0}
              >
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
