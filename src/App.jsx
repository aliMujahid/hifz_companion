import React, { useState, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom"; 


import JuzPage from "./pages/JuzPage";
import SurahPage from "./pages/SurahPage";


import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";


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



function AppContent() {
  const location = useLocation(); // Get the current location object (includes pathname)
  const [value, setValue] = useState(0);

  // Map the current path to the index of the active tab
  useEffect(() => {
    switch (location.pathname) {
      case "/juz":
        setValue(1);
        break;
      case "/":
      default:
        setValue(0);
        break;
    }
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Note: The LinkTab component handles the actual routing, 
    // this just updates the local state for the active tab indicator.
  };

  return (
    
    <>
      <AppBar position="static" color="inherit"
        elevation={0}   
        sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ flexDirection: 'column', py: 1 }}>

          <Typography 
            variant="h5" 
            component="div" 
            align="center"
            sx={{ 
                width: '100%', 
                fontWeight: 'bold',
                mb: 2 
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
                '& .MuiTabs-indicator': {
                    // Custom styles for the indicator line if needed, e.g., to make it thicker
                    height: 3, // Thicker underline
                    borderRadius: '3px 3px 0 0', // Rounded corners for the underline
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
          {/* Default route shows the SurahPage */}
          <Route path="/" element={<SurahPage />} /> 
          
          {/* Route for the Juz (Para) Page */}
          <Route path="/juz" element={<JuzPage />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
    return (
        <Router>
           
            <AppContent /> 
        </Router>
    )
}
