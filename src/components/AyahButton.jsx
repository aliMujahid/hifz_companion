import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// AyahButton is now controlled by the parent component
export default function AyahButton({ ayah, isSelected, onClick }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: theme.spacing(1.5),
                borderRadius: theme.shape.borderRadius,
                p: 1,
                border: `1px solid ${
                    isSelected
                        ? theme.palette.primary.main // Solid border for selected
                        : theme.palette.divider
                }`,
                backgroundColor: isSelected
                    ? theme.palette.primary.light + "1a" // Subtle background for selected
                    : theme.palette.background.paper, 
                boxShadow: isSelected ? theme.shadows[2] : "none",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
            // Use the passed onClick handler
            onClick={onClick}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    minWidth: 50,
                    height: "auto",
                    borderRadius: theme.shape.borderRadius,

                    // Background color changes based on the isSelected prop
                    background: isSelected
                        ? theme.palette.primary.main // Solid color for selected
                        : "linear-gradient(45deg, #1fae7e, #49c488)", // Gradient for unselected
                    color: theme.palette.common.white,
                    fontWeight: "bold",
                    boxShadow: theme.shadows[1],
                }}
            >
                <Typography variant="h4">{ayah}</Typography>
            </Box>
        </Box>
    );
}