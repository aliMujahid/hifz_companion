import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// Example Data (for context)
const surahData = {
  index: 18,
  englishName: "Al-Kahf (The Cave)",
  arabicName: "الكهف",
  revelationType: "Meccan",
};

export default function SurahRow() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex", // Main container is a flexbox
        alignItems: "stretch", // Crucial: Makes children stretch to fill height
        border: "1px solid #ddd",
        borderRadius: 1,
        maxWidth: 500,
        margin: "0 auto",
        overflow: "hidden", // Ensures the rounded corners are respected
      }}
    >
      {/* -------------------- LEFT SECTION: Revelation Type & Surah Index -------------------- */}
      <Box
        sx={{
          // Gradient background for the entire left section
          backgroundImage: "linear-gradient(135deg, #00C4AA 0%, #00A152 100%)",
          color: theme.palette.common.white,
          display: "flex",
          flexDirection: "column", // Stack contents vertically
          alignItems: "center",
          justifyContent: "center", // Center content vertically
          px: 2, // Horizontal padding for text
          py: 1.5, // Vertical padding
          flexShrink: 0, // Prevent this section from shrinking
          minWidth: 90, // Give it a fixed minimum width
          textAlign: "center",
        }}
      >
        {/* Revelation Type */}
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
            lineHeight: 1.2, // Adjust line height for better appearance
          }}
        >
          {surahData.revelationType}
        </Typography>

        {/* Surah Index */}
        <Typography
          variant="h4" // Larger for hierarchy
          sx={{
            fontWeight: "extrabold",
            lineHeight: 1, // Keep tight to its text
            mt: 0.5, // Small margin from revelation type
          }}
        >
          {surahData.index}
        </Typography>
      </Box>

      {/* -------------------- RIGHT SECTION: Titles -------------------- */}
      <Box
        sx={{
          flexGrow: 1, // This section takes up remaining space
          display: "flex",
          flexDirection: "column", // Stack titles vertically
          justifyContent: "center", // Center titles vertically
          px: 2, // Horizontal padding for titles
          py: 1.5, // Vertical padding
          // Add a left border to separate from the colored section (optional)
          // borderLeft: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* English Name */}
        <Typography
          className="englishTitle"
          variant="subtitle1"
          sx={{
            textAlign: "left", // Aligns to the left within its container
            fontWeight: "bold",
            mb: 0.5, // Space between titles
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {surahData.englishName}
        </Typography>

        {/* Arabic Name */}
        <Typography
          fontFamily="AlQalam"
          dir="rtl"
          variant="h6"
          className="arabicTitle"
          sx={{
            textAlign: "left", // Aligns to the left within its container
            color: "text.secondary", // Use secondary for Arabic to create contrast
            fontWeight: "medium",
          }}
        >
          {surahData.arabicName}
        </Typography>
      </Box>
    </Box>
  );
}
