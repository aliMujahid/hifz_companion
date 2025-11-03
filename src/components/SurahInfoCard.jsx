import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

export default function SurahInfoCard({ surah, onSurahCardClick, selected }) {
  const theme = useTheme();

  return (
    <Box
      tabIndex={0}
      onClick={onSurahCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSurahCardClick();
          event.preventDefault(); // Prevent default scroll/action
        }
      }}
      sx={{
        display: "flex",
        alignItems: "stretch",
        border: `1px solid ${selected ? theme.palette.primary.light : "#ddd"}`,
        borderRadius: 1,
        width: "6rem",
        margin: "0 auto",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          cursor: "pointer",
        },
      }}
    >
      {/* -------------------- LEFT SECTION: Revelation Type & Surah Index -------------------- */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,

          backgroundImage: selected
            ? `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : "linear-gradient(45deg, #00C4AA 0%, #00A152 100%)",
          color: theme.palette.common.white,
          borderBottomRightRadius: 8, // Rounded corner on the inner side
          px: 1,
          py: 0.5,
          zIndex: 1, // Ensure it sits above the title content
        }}
      >
        <Typography
          variant="caption" 
          sx={{
            fontWeight: "extrabold",
            lineHeight: 1,
          }}
        >
          {surah.number}
        </Typography>
      </Box>

      {/* -------------------- RIGHT SECTION: Titles -------------------- */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 1, 
          py: 1.5, // Vertical padding
          paddingRight: 1.5,
        }}
      >
        {/* Arabic Name */}
        <Typography
          fontFamily="AlQalam"
          dir="rtl"
          
          className="arabicTitle"
          sx={{
            textAlign: "right", 
            color: "text.primary",
            fontWeight: "bold",
            fontSize:"1.5rem",
          }}
        >
          {surah.name}
        </Typography>
      </Box>
    </Box>
  );
}
