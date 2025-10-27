import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import JuzPage from "./pages/JuzPage";
import SurahPage from "./pages/SurahPage"; // Use the list page here
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import SurahDetailPage from "./pages/SurahDetailPage";
import JuzDetailPage from "./pages/JuzDetailPage";

const BASE_PATH = "/hifz_companion";

// Helper component to pass the `to` prop correctly to MUI components
const LinkTab = React.forwardRef((props, ref) => {
  return (
    <Tab
      ref={ref}
      component={Link} // Use React Router's Link component
      to={props.href} // Pass the route path as 'href'
      {...props}
      sx={{ mx: 5 }}
    />
  );
});

const theme = createTheme({
  typography: {
    fontFamily: "Cabin, Open Sans, sans-serif",
  },
});

function AppContent() {
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Check if the path starts with /surah/ to keep the 'Suras' tab active
    if (location.pathname.startsWith("/surah")) {
      setValue(0);
    } else if(location.pathname.startsWith("/juz")){
      setValue(1);
    }else {
      switch (location.pathname) {
        case "/juz":
          setValue(1);
          break;
        case "/":
        default:
          setValue(0);
          break;
      }
    }
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ flexDirection: "column", py: 1 }}>
          <Typography
            variant="h5"
            component="div"
            align="center"
            sx={{
              width: "100%",
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Baitul Hikmat
          </Typography>

          <Tabs
            value={value}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="navigation tabs"
            centered
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <LinkTab label="Suras" href="/" />
            <LinkTab label="Paras" href="/juz" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 0 }}>
        <Routes>
          {/* 1. Surah List Page */}
          <Route path="/" element={<SurahPage />} />

          {/* 2. Surah Detail Page with dynamic ID */}
          <Route path="/surah/:surahNumber" element={<SurahDetailPage />} />

          {/* 3. Juz (Para) Page */}
          <Route path="/juz" element={<JuzPage />} />

          {/* 4. Juz (Para) Detail Page with dynamic ID */}
          <Route path="/juz/:juzNumber" element={<JuzDetailPage />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <Router basename={BASE_PATH}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}
