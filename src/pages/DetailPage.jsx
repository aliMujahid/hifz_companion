import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import AyahButton from "../components/AyahButton";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import SurahData from "../../surahData.json";
import JuzData from "../../juzData.json";
import surahInJuz from "../../surahInJuz.json";
import { Button, Checkbox, FormControlLabel, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DetailPage() {
  const navigate = useNavigate();
  // Get the sectionType(section/para) and sectionNumber parameter from the URL
  const { sectionType, sectionNumber: sectionNumberParam } = useParams();
  const sectionNumber = parseInt(sectionNumberParam);
  const data = sectionType === "surah" ? SurahData : JuzData;

  // Get the section data based on the URL parameter
  const section = useMemo(() => {
    if (!isNaN(sectionNumber) && sectionNumber > 0 && sectionNumber <= data.length) {
      return data[sectionNumber - 1]; // data is 0-indexed, section number is 1-indexed
    }
    // Fallback for an invalid number or initial render (optional: add error handling)
    return {
      number: 0,
      name: "Error",
      englishName: "Error",
      englishNameTranslation: "Not Found",
      numberOfAyahs: 0,
      revelationType: "",
      firstAyahIndex: 0,
    };
  }, [sectionNumber]);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedAyahs, setSelectedAyahs] = useState(Array.from({ length: section.numberOfAyahs }, (_, i) => false))
  const ayahList = Array.from({ length: section.numberOfAyahs }, (_, i) => i)

  const handleAyahSelection = (ayahNumber) => {
      let newSelectedList = [...selectedAyahs];
      newSelectedList[ayahNumber] = !selectedAyahs[ayahNumber]
      setSelectedAyahs(newSelectedList)
    }


  const isAyahSelected = (ayahNumber) => {
    if (selectAll) return true;
    return selectedAyahs[ayahNumber]
  };

  // Select All Handler
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {      
      setSelectedAyahs(Array.from({ length: section.numberOfAyahs }, (_, i) => true))
    }else{
      setSelectedAyahs(Array.from({ length: section.numberOfAyahs }, (_, i) => false))
    }
  };

  const trueIndices = useMemo(()=>{
    let indices = selectedAyahs.map((isSelected, index)=>isSelected? index: null);
    return indices.filter(index=>index!==null);
  }, [selectedAyahs])

  const handlePlayButtonClick = () => {
    if (trueIndices.length == 0) return;

    const queryParams = new URLSearchParams({
      start: section.firstAyahIndex,
      ayaat: trueIndices.join(",")
    }).toString();

    navigate(`/play?${queryParams}`);
  };

  const truncatedAyahList = useMemo(()=>{
    let _string = trueIndices.map((i)=>i+1).join(", ")
    if (_string.length > 14) return _string.slice(0, 15)+"..."
    return _string
  },[trueIndices])
  
    const currentJuzSurahs = sectionType === "juz"
      ? surahInJuz[sectionNumber - 1].surahs
      : [];
  
    let juzLocalAyahIndex = 0;

  return (
    <Box sx={{ p: 2 }}>      
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              {section.englishName}
            </Typography>
            <Typography
              variant="h4"
              fontFamily={"alQalam"}
              component="h1"
              gutterBottom
              align="center"
            >
              {section.name}
            </Typography>
          </Box>
          <Box sx={{display:"flex", justifyContent:"space-between", mt:2, px:2}}>
            <Box width="20%" sx={{}}></Box>
            <Box sx={{display:"flex", justifyContent:"space-between", width:"45%"}}>
            <Typography sx={{my:"auto"}}>Selected Ayaat{sectionType==="juz"?" (Para-local)":""}: {truncatedAyahList} </Typography>
            <Button onClick={handlePlayButtonClick} variant="contained" sx={{bgcolor:"#11171d", px:3, letterSpacing: '2px',}}>Play</Button>
          </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",              
              flexWrap: "wrap",
              gap: 0,
              my: 2,
            }}
          >
            <Typography
              sx={{
          
                fontSize: "1.2rem",
              }}
            >
              Select Ayaat to Play
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  name="selectAll"
                  color="primary"
                />
              }
              label="Select All Ayaat"
              sx={{
                // Style the label text
                "& .MuiTypography-root": {
                  fontSize: "0.7rem",
                  fontWeight: "400",
                },
              }}
            />
          </Box>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            {sectionType === "juz" && currentJuzSurahs.map((surah) => {
          return (
            <Container maxWidth="lg" key={surah.surah} sx={{ pt: 5 }}>
              <Box sx={{
                display:"flex",
                width:"100%",
                justifyContent:"space-between"
              }}>
                <Typography
                variant="h4"
                //fontFamily={"alQalam"}
                component="h1"
                gutterBottom
                align="left"
              >
                {SurahData[surah.surah - 1].englishName}
              </Typography>
              <Typography
                variant="h4"
                fontFamily={"alQalam"}
                component="h1"
                gutterBottom
                align="left"
                dir="rtl"
              >
                {SurahData[surah.surah - 1].name}
              </Typography>
              </Box>
              <Grid
                container
                spacing={2}
                justifyContent="left"
                sx={{ width: "100%" }}
              >
                {surah.ayahs.map((ayah) => {
                  const currentJuzLocalIndex = juzLocalAyahIndex;

                  juzLocalAyahIndex++;

                  return (
                    <Grid item key={`${surah.surah}:${ayah}`}>
                      <AyahButton
                        ayah={ayah}
                        isSelected={isAyahSelected(currentJuzLocalIndex)}
                        onClick={() =>
                          handleAyahSelection(currentJuzLocalIndex)
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
              <Divider />
            </Container>
          );
        })}
            
            {sectionType === "surah" && ayahList.map((ayahNumber) => (
              <Grid item key={ayahNumber}>
                <AyahButton
                  ayah={ayahNumber+1}
                  isSelected={isAyahSelected(ayahNumber)}
                  onClick={() => handleAyahSelection(ayahNumber)}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
    </Box>
  );
}
