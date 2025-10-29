import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Card from "@mui/material/Card";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import DATA from "../../surahData.json";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Tooltip from "@mui/material/Tooltip";
import NotesIcon from "@mui/icons-material/Notes";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CustomTextField from "./playerComponents/CustomTextField";

export default function Player({
  ayahNumberFirst,
  totalAyah,
  setPlayerPageCurrentTrackIndex,
  showText,
  toggleShowText,
}) {
  const theme = useTheme();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [loop, setLoop] = useState(false);
  const audioRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [gapSeconds, setGapSeconds] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);

  useEffect(() => {
    setPlayerPageCurrentTrackIndex(currentTrackIndex);
  }, [currentTrackIndex]);

  const audioSourceUrl = useMemo(() => {
    // Wait until URL parameters are parsed
    if (ayahNumberFirst === null || totalAyah === 0) return [];

    const urls = [];
    const surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);

    for (let i = 0; i < totalAyah; i++) {
      const currentGlobalAyah = ayahNumberFirst + i;

      // Check if the current ayah is the start of a new surah (and not Surah Tawba's start)
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
  }, [ayahNumberFirst, totalAyah]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
  }, [currentTrackIndex, audioSourceUrl.length]);

  const PlaybackOptions = ({ isExpanded, showText }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        // Optional: Add a shadow for the dropdown effect when showText is true
        ...(showText && {
          position: "absolute",
          top: "auto",
          right: 0,
          bottom: "14%", // Position above the main player bar
          width: { xs: 250, sm: 300, md: 350 }, // Fixed width for dropdown
          zIndex: 1301,
          boxShadow: 3,
          transformOrigin: "bottom right",
          animation: isExpanded
            ? "slideUp .2s ease-out forwards"
            : "slideDown .2s ease-in forwards",
          "@keyframes slideUp": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes slideDown": {
            from: { opacity: 1, transform: "translateY(0)" },
            to: {
              opacity: 0,
              transform: "translateY(10px)",
              visibility: "hidden",
            },
          },
        }),
      }}
    >
      {/* 1. Total Ayahs */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Selected Ayahs:
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          {totalAyah}
        </Typography>
      </Box>

      {/* 2. Repeat Each Ayah */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Repeat Each Ayah:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CustomTextField
            setOuterValue={setRepeatCount}
            outerValue={repeatCount}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 40 }}
          >
            times
          </Typography>
        </Box>
      </Box>

      {/* 3. Set a Gap between ayahs */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Set a Gap Between Ayahs:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CustomTextField
            outerValue={gapSeconds}
            setOuterValue={setGapSeconds}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 40 }}
          >
            seconds
          </Typography>
        </Box>
      </Box>

      {/* 4. Loop Selection */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Loop Through Ayahs:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CustomTextField
            setOuterValue={setLoopCount}
            outerValue={loopCount}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 40 }}
          >
            times
          </Typography>
        </Box>
      </Box>

      {/* 5. Show Ayah Text */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Show Ayah Text:
        </Typography>
        <Tooltip title={showText ? "Text is Visible" : "Text is Hidden"}>
          <IconButton
            onClick={toggleShowText}
            aria-label="Toggle text display"
            color={showText ? "primary" : "default"}
            sx={{
              border: showText
                ? `2px solid ${theme.palette.primary.main}`
                : `2px solid ${theme.palette.divider}`,
              backgroundColor: showText
                ? theme.palette.primary.main + "1A"
                : "transparent",
              p: "6px",
              mr: 8,
            }}
          >
            {showText ? <NotesIcon /> : <NotesOutlinedIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // Player Controls Section (Bottom Section)
  const PlayerControls = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 1, sm: 3, md: 5 },
        py: 1,
        maxWidth: "100%",
      }}
    >
      {/* Progress Bar and Time */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          width: "100%",
        }}
      >
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
            height: 6,
            py: 1,
            "& .MuiSlider-thumb": {
              width: 14,
              height: 14,
              transition: "0.2s",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: `0 0 0 8px ${theme.palette.primary.main}1A`,
              },
            },
          }}
        />

        <Typography variant="caption" sx={{ minWidth: 35, textAlign: "right" }}>
          {formatTime(duration)}
        </Typography>
      </Box>

      {/* Control Buttons and Repeat Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Navigation Buttons */}
        <Box>
          <Tooltip title="Previous Ayah">
            <IconButton
              aria-label="previous"
              onClick={handlePrevClick}
              disabled={audioSourceUrl.length === 0}
              size="large"
            >
              <SkipPreviousIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <IconButton
            aria-label="play/pause"
            onClick={controllPlayPause}
            sx={{ mx: 2, p: 0.5 }}
            disabled={audioSourceUrl.length === 0}
          >
            {paused ? (
              <PlayArrowIcon
                sx={{
                  height: 48,
                  width: 48,
                  color: theme.palette.primary.main,
                }}
              />
            ) : (
              <PauseIcon
                sx={{
                  height: 48,
                  width: 48,
                  color: theme.palette.primary.main,
                }}
              />
            )}
          </IconButton>
          <Tooltip title="Next Ayah">
            <IconButton
              aria-label="next"
              onClick={handleNextClick}
              disabled={audioSourceUrl.length === 0}
              size="large"
            >
              <SkipNextIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Options Toggle Button (Replaces Loop/Notes buttons here) */}
        <Box>
          <Tooltip
            title={
              isExpanded ? "Hide Playback Options" : "Show Playback Options"
            }
          >
            <IconButton
              onClick={toggleExpanded}
              aria-label="Toggle playback options"
              color="default"
              sx={{
                p: "8px",
                transition: "all 0.2s",
                // Only show this button when showText is TRUE (fixed to bottom)
                display: showText ? "inline-flex" : "none",
              }}
            >
              {isExpanded ? <SettingsIcon /> : <SettingsOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  // --- Main Render ---

  // Centered Card Layout (showText === false)
  if (!showText) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          position: "static",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            width: { xs: "95%", sm: 500 },
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 8,
          }}
        >
          {PlaybackOptions({ isExpanded: true, showText: false })}
          {PlayerControls}
          <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
        </Card>
      </Box>
    );
  }

  // Bottom-Stuck Bar Layout (showText === true)
  return (
    <>
      {PlaybackOptions({ isExpanded: isExpanded, showText: true })}
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 1300,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            borderRadius: 0,
            position: "relative", // Needed for absolute positioning of dropdown
          }}
        >
          {/* Playback Options Dropdown */}

          {PlayerControls}
          <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
        </Card>
      </Box>
    </>
  );
}
