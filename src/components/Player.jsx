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
import KeyboardDoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUp from "@mui/icons-material/KeyboardDoubleArrowUp";
import Tooltip from "@mui/material/Tooltip";
import NotesIcon from "@mui/icons-material/Notes";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CustomTextField from "./playerComponents/CustomTextField";
import QURAN from "../../indopak-nastaleeq-vers.json";

export default function Player({
  ayahNumberFirst,
  ayahList,
  setPlayerPageCurrentTrackIndex,
  showText,
  toggleShowText,
}) {
  const theme = useTheme();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [loopCount, setLoopCount] = useState(1);
  const [currentSelectionLoop, setCurrentSelectionLoop] = useState(0);
  const audioRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [gapSeconds, setGapSeconds] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);

  useEffect(() => {
    setPlayerPageCurrentTrackIndex(currentTrackIndex);
  }, [currentTrackIndex]);

  const [audioSourceUrl, globalIndices] = useMemo(() => {
    // Wait until URL parameters are parsed
    if (ayahNumberFirst === null || ayahList === null) return [];

    const urls = [];
    const indices = [];
    const surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);

    ayahList.map((i) => {
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
          indices.push(1);
        }
      }

      // Add the actual ayah track
      urls.push(
        `https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/${currentGlobalAyah}.mp3`
      );
      indices.push(currentGlobalAyah);
    });

    return [urls, indices];
  }, [ayahNumberFirst, ayahList]);

  const selectedAyahText = useMemo(() => {
    let currentGlobalIndex = globalIndices[currentTrackIndex];
    if (currentGlobalIndex === 1) return "Bismillah";
    let verseKey = QURAN[currentGlobalIndex].verse_key;
    let surahName = DATA[verseKey.split(":")[0] - 1].englishName;
    return "Surah " + surahName + " - Ayah: " + verseKey.split(":")[1];
  }, [globalIndices, currentTrackIndex]);

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
        } else {
          const nextSelectionLoop = currentSelectionLoop + 1;

          if (nextSelectionLoop < loopCount) {
            setCurrentSelectionLoop(nextSelectionLoop);
            goToNextTrack();
          } else {
            setPaused(true);
            setIsDone(true);
            setCurrentSelectionLoop(0);
          }
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
    loopCount,
    currentSelectionLoop,
    gapSeconds,
  ]);

  useEffect(() => {
    setCurrentTrackIndex(0);
    setCurrentSelectionLoop(0);
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
        setCurrentSelectionLoop(0);
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
          position: "fixed",
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
      {isExpanded && showText && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "10px" }}></Box>
          <IconButton
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            onClick={toggleExpanded}
          >
            <KeyboardDoubleArrowDown />
          </IconButton>
        </Box>
      )}
      {/* 1. Total Ayahs */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Now Playing:
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          {selectedAyahText}
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
          Set a Gap Between Ayaat:
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
          Loop Through All Ayaat:
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
          {showText ? "Hide" : "Show"} Ayaat Text:
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

        {!isExpanded && showText && (
          <IconButton
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
            onClick={toggleExpanded}
          >
            <KeyboardDoubleArrowUp />
          </IconButton>
        )}
      </Box>

      {/* Control Buttons and Repeat Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: !showText ? "inherit" : { xs: "100%", sm: "90%", md: "80%" },
        }}
      >
        <Typography>
          Repeat: {currentRepeat + 1}/{repeatCount}
        </Typography>
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
            sx={{ mx: showText ? 0 : 2, p: 0.5 }}
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
        <Typography>
          Loop: {currentSelectionLoop + 1}/{loopCount}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {!showText && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            pt: 5,
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
              height: 500,
              p: 3,
            }}
          >
            {PlaybackOptions({ isExpanded: true, showText: false })}
            {PlayerControls}
          </Card>
        </Box>
      )}
      {showText && PlaybackOptions({ isExpanded: isExpanded, showText: true })}
      {showText && (
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
          </Card>
        </Box>
      )}
      <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
    </>
  );
}
