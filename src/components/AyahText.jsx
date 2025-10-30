import { Box, Typography } from "@mui/material";
import {useTheme} from "@mui/material/styles";

import { useState, useEffect, useMemo, useRef } from "react";
import QURAN from "../../indopak-nastaleeq-vers.json";
import DATA from "../../surahData.json";

const BISMILLAH_TEXT = {
  text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  isBismillah: true,
};

const AyahText = ({ayahNumberFirst, ayahList, currentAyahTextIndex}) => {
    const theme = useTheme();
    const itemRefs = useRef([]);

    const ayahTextsWithBismillah = useMemo(() => {
    if (ayahNumberFirst === null || ayahList === null) return [];

    const surahFirstAyahNumberList = DATA.map((surah) => surah.firstAyahIndex);
    const texts = [];

    ayahList.map((i)=> {
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
    })

    return texts;
  }, [ayahNumberFirst, ayahList]);

  // Effect to scroll the current item into view
  useEffect(() => {
    const currentItemRef = itemRefs.current[currentAyahTextIndex];
    if (currentItemRef) {
      currentItemRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentAyahTextIndex, ayahTextsWithBismillah]);

  return (
    <Box
          sx={{
            pb: 20,
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
                ref={(el) => (itemRefs.current[index] = el)}
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
  );
};

export default AyahText;
