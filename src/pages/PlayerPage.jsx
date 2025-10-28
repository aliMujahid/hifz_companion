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
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import DATA from "../../surahData.json";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import QURAN from "../../indopak-nastaleeq-vers.json";
import NotesIcon from "@mui/icons-material/Notes";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

// Bismillah text object (used before all Surahs except Surah 1 and Surah 9)
const BISMILLAH_TEXT = {
  text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  isBismillah: true,
};

export default function PlayerPage() {
  const theme = useTheme();

  const [ayahNumberFirst, setAyahNumberFirst] = useState(null);
  const [totalAyah, setTotalAyah] = useState(0);
  const [gapSeconds, setGapSeconds] = useState(0);

  const [repeatCount, setRepeatCount] = useState(1);
  const [showText, setShowText] = useState(true);
  const [gapDraft, setGapDraft] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Parse and validate parameters
    const start = parseInt(params.get("start"), 10) || 1;
    const count = parseInt(params.get("count"), 10) || 1;
    const rep = parseInt(params.get("rep"), 10) || 1;
    const gap = parseFloat(params.get("gap")) || 0;
    const show = params.get("show") === "true";

    setAyahNumberFirst(start);
    setTotalAyah(count);
    setRepeatCount(rep);
    setGapSeconds(gap);
    setShowText(show);
    setGapDraft(String(gap));
  }, []);

  const ayahTextsWithBismillah = useMemo(() => {
    if (ayahNumberFirst === null || totalAyah === 0) return [];

    const surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);
    const texts = [];

    for (let i = 0; i < totalAyah; i++) {
      const currentGlobalAyah = ayahNumberFirst + i;

      // Check if the current ayah is the start of a new surah (and not Surah 1 or Surah 9)
      if (
        surahFirstAyahNumberList.includes(currentGlobalAyah) &&
        currentGlobalAyah !== 1 && // Exclude Al-Fatiha (Ayah 1)
        currentGlobalAyah !== 1236 // Exclude At-Tawbah
      ) {
        texts.push({
          ...BISMILLAH_TEXT,
          key: `bismillah-${currentGlobalAyah}`,
        });
      }

      // Add the actual ayah text
      const ayah = QURAN[currentGlobalAyah];
      if (ayah) {
        texts.push({ ...ayah, key: `ayah-${currentGlobalAyah}` });
      }
    }

    return texts;
  }, [ayahNumberFirst, totalAyah]);

  useEffect(() => {
    setGapDraft(String(gapSeconds));
  }, [gapSeconds]);

  const handleGapCommit = () => {
    const num = parseFloat(gapDraft);

    // Validation Logic (0 to 30 seconds)
    if (isNaN(num) || num < 0 || num > 1000) {
      // Reset the draft state to the last valid value if input is invalid
      setGapDraft(String(gapSeconds));
    } else {
      // Update the main gapSeconds state
      setGapSeconds(num);
    }
  };

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

  const toggleShowText = () => {
    setShowText(!showText);
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

  const currentAyahTextIndex = useMemo(() => {
    if (audioSourceUrl.length === 0) return -1;

    let textIndex = -1;
    let audioTrackCounter = 0;

    for (let i = 0; i < ayahTextsWithBismillah.length; i++) {
      const item = ayahTextsWithBismillah[i];

      if (item.isBismillah) {
        // If the audio track index matches the Bismillah track index, use the Bismillah's text index
        if (audioTrackCounter === currentTrackIndex) {
          textIndex = i;
          break;
        }
      } else {
        // If the audio track index matches the Ayah track index, use the Ayah's text index
        if (audioTrackCounter === currentTrackIndex) {
          textIndex = i;
          break;
        }
      }
      // Increment the audio track counter for the next text item
      audioTrackCounter++;
    }

    return textIndex;
  }, [currentTrackIndex, ayahTextsWithBismillah, audioSourceUrl.length]);

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
    <>
      {showText && (
        <Box
          sx={{
            pb: isExpanded ? 35 : 20,
            pt: 2,
            px: { xs: 2, sm: 4, md: 8 },
            width: { xs: "100%", sm: "80%", md: "75%", lg: "60%" },
            mx: "auto",
          }}
        >
          {ayahTextsWithBismillah.map((item, index) => {
            const isCurrentItem = index === currentAyahTextIndex;
            const isBismillah = item.isBismillah;
            const isAyah = item.verse_key !== undefined;

            return (
              <Typography
                key={item.key}
                fontSize={{
                  xs: isBismillah ? "1.5rem" : "1.8rem",
                  sm: isBismillah ? "1.8rem" : "2rem",
                  md: isBismillah ? "2rem" : "2.5rem",
                }}
                fontFamily={"alQalam"}
                dir="rtl"
                sx={{
                  mt: isBismillah ? 5 : 0,
                  mb: isBismillah ? 2 : 3,
                  lineHeight: 2.2,
                  transition: "background-color 0.3s, color 0.3s",
                  p: 1,
                  borderRadius: 1,
                  textAlign: isBismillah ? "center" : "right",
                  backgroundColor: isCurrentItem
                    ? theme.palette.primary.light + "1A"
                    : "transparent",
                  color: isCurrentItem
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  fontWeight: isBismillah ? "bold" : "normal",
                }}
              >
                {item.text}
              </Typography>
            );
          })}
        </Box>
      )}
      <Box
        sx={{
          width: "100%",
          boxShadow: 8,
          ...(!showText
            ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                position: "static",
                backgroundColor: theme.palette.background.default,
              }
            : {
                position: "fixed",
                bottom: 0,
                left: 0,
                zIndex: 1300,
                borderTop: `1px solid ${theme.palette.divider}`,
              }),
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            width: showText ? "100%" : { xs: "95%", sm: 500 },
            backgroundColor: theme.palette.background.paper,
            borderRadius: showText ? 0 : 2,
            pt: 2,
            pb: { xs: 1, sm: 2 },
            ...(!showText && {
              boxShadow: 8,
              "& .MuiTypography-root": {
                textAlign: "center",
              },
            }),
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              px: { xs: 0, sm: 2, md: 5 },
              py: 0,
            }}
          >
            {/* Control Group: Repeat & Gap - Use a structured layout */}
            {isExpanded && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: { xs: "flex-start", sm: "space-between" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 2, sm: 4 },
                  mb: 2,
                  p: 1,
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 1,
                }}
              >
                {/* Repeat Controls Group */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Repeats:
                  </Typography>
                  {[1, 2, 3, 4, 5, 7].map((count) => (
                    <Button
                      key={count}
                      variant={repeatCount === count ? "contained" : "outlined"}
                      value={count}
                      onClick={handleClick}
                      size="small"
                      sx={{ minWidth: "35px", p: "4px 8px" }}
                    >
                      {count}
                    </Button>
                  ))}
                </Box>
                {/* Gap Control Group */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Gap (s):
                  </Typography>
                  <TextField
                    label=""
                    placeholder="Seconds"
                    type="number"
                    size="small"
                    value={gapDraft}
                    onChange={(e) => setGapDraft(e.target.value)}
                    onBlur={handleGapCommit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleGapCommit();
                      }
                    }}
                    sx={{ width: 80 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Current: {gapSeconds.toFixed(1)}s
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Progress Bar and Time */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
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

              <Typography
                variant="caption"
                sx={{ minWidth: 35, textAlign: "right" }}
              >
                {formatTime(duration)}
              </Typography>
              <IconButton
                aria-label={
                  isExpanded ? "Collapse Controls" : "Expand Controls"
                }
                onClick={toggleExpanded}
                size="medium"
                color="default"
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
                flexDirection: !showText ? "column" : "row",
                gap: !showText ? 2 : 0,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ order: !showText ? 2 : 0 }}
              >
                Ayah:{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: theme.palette.text.primary,
                  }}
                >
                  {ayahTextsWithBismillah[currentAyahTextIndex]?.isBismillah
                    ? ayahTextsWithBismillah[currentAyahTextIndex + 1]
                        ?.verse_key || "N/A"
                    : ayahTextsWithBismillah[currentAyahTextIndex]?.verse_key ||
                      "N/A"}
                </span>{" "}
                | Repeat:{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: theme.palette.text.primary,
                  }}
                >
                  {currentRepeat + 1}/{repeatCount}
                </span>
              </Typography>
              <Box sx={{ order: !showText ? 1 : 0 }}>
                <IconButton
                  aria-label="previous"
                  onClick={handlePrevClick}
                  disabled={audioSourceUrl.length === 0}
                  size="large"
                >
                  <SkipPreviousIcon fontSize="large" />
                </IconButton>
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
                <IconButton
                  aria-label="next"
                  onClick={handleNextClick}
                  disabled={audioSourceUrl.length === 0}
                  size="large"
                >
                  <SkipNextIcon fontSize="large" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, order: !showText ? 3 : 0 }}>
                {/* --- NEW SHOW TEXT TOGGLE BUTTON --- */}
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
                    borderRadius: "50%",
                    p: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  {showText ? <NotesIcon /> : <NotesOutlinedIcon />}
                </IconButton>

                <IconButton
                  onClick={toggleLoop}
                  aria-label="Toggle playlist loop"
                  color={loop ? "primary" : "default"} // Use default color when off
                  sx={{
                    border: loop
                      ? `2px solid ${theme.palette.primary.main}`
                      : `2px solid ${theme.palette.divider}`, // Border even when off
                    backgroundColor: loop
                      ? theme.palette.primary.main + "1A"
                      : "transparent", // Light background when on
                    borderRadius: "50%",
                    p: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <RepeatIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <audio ref={audioRef} src={audioSourceUrl[currentTrackIndex]}></audio>
        </Card>
      </Box>
    </>
  );
}
