import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import AyahText from "../components/AyahText";
import Player from "../components/Player";
import { useNavigate } from "react-router-dom";
import surahData from "../../surahData.json";

function findSurahByGlobalIndex(globalIndex) {
  for (let i = surahData.length - 1; i >= 0; i--) {
    if (globalIndex >= surahData[i].firstAyahIndex) {
      return surahData[i];
    }
  }
  return null; // Should not happen for valid indices
}

function getAyahInfo(globalIndex) {
  const surah = findSurahByGlobalIndex(globalIndex);
  if (!surah) {
    return null;
  }

  const relativeAyahNumber = globalIndex - surah.firstAyahIndex + 1;

  return {
    surahName: surah.englishName,
    ayahNumber: relativeAyahNumber,
    surahNumber: surah.number,
  };
}

function formatAyahRanges(startGlobalIndex, subsequentIndices) {
  const allGlobalIndices = [
    ...subsequentIndices.map((i) => startGlobalIndex + i),
  ];

  // 2. Map all global indices to their Surah and relative Ayah number
  const ayahInfos = allGlobalIndices
    .map((index) => getAyahInfo(index))
    .filter((info) => info !== null); // Filter out any potential nulls

  // 3. Group ayahs by Surah
  // We use a Map to preserve insertion order (which we'll sort)
  const groupedBySurah = new Map();
  for (const info of ayahInfos) {
    if (!groupedBySurah.has(info.surahName)) {
      groupedBySurah.set(info.surahName, {
        surahNumber: info.surahNumber,
        ayahs: [],
      });
    }
    groupedBySurah.get(info.surahName).ayahs.push(info.ayahNumber);
  }

  // 4. Process each group into range strings
  const surahStrings = [];

  // Sort groups by Surah number to maintain Quranic order (e.g., Al-Faatiha before Al-Baqara)
  const sortedGroups = Array.from(groupedBySurah.entries()).sort(
    ([, a], [, b]) => a.surahNumber - b.surahNumber
  );

  for (const [surahName, data] of sortedGroups) {
    // Ensure ayahs within the surah are sorted
    const ayahs = data.ayahs.sort((a, b) => a - b);
    if (ayahs.length === 0) continue;

    const ranges = [];
    let startRange = ayahs[0];
    let endRange = ayahs[0];

    // Loop through ayahs to find consecutive ranges
    for (let i = 1; i < ayahs.length; i++) {
      if (ayahs[i] === endRange + 1) {
        // This ayah is consecutive, extend the current range
        endRange = ayahs[i];
      } else {
        // End of a range; push the completed range and start a new one
        ranges.push(
          startRange === endRange
            ? `${startRange}`
            : `${startRange}-${endRange}`
        );
        startRange = ayahs[i];
        endRange = ayahs[i];
      }
    }

    // After the loop, push the last pending range
    ranges.push(
      startRange === endRange ? `${startRange}` : `${startRange}-${endRange}`
    );

    // Format the final string for this Surah
    surahStrings.push(`${surahName}(${ranges.join(", ")})`);
  }

  // 5. Join all Surah strings with a comma and space
  return surahStrings.join(", ");
}

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

        <Box sx={{ flexGrow: 1, p: 2 }}>
          {showText && (
            <AyahText
              ayahNumberFirst={ayahNumberFirst}
              ayahList={ayahList}
              currentAyahTextIndex={currentTrackIndex}
            />
          )}
          {!showText && ayahNumberFirst && ayahList && (
            <Box
              sx={{
                pb: 0,
                pt: 2,
                px: { xs: 2, sm: 4, md: 8 },
                width: { xs: "100%", sm: "80%", md: "75%", lg: "60%" },
                mx: "auto",
              }}
            >
              <Typography
                fontSize={{
                  xs: "0.8rem",
                  sm: "1rem",
                  md: "1.5rem",
                }}
                sx={{
                  width: "80%",
                  mx: "auto",
                  textAlign: "center",
                }}
              >
                {formatAyahRanges(ayahNumberFirst, ayahList)}
              </Typography>
            </Box>
          )}
        </Box>
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
