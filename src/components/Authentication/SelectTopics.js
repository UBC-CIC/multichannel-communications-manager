import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ImageListItemBar,
  Grid,
  Stack,
  Pagination,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageListItem, {
  imageListItemClasses,
} from "@mui/material/ImageListItem";
import { styled } from "@mui/material/styles";
import { API, graphqlOperation, Storage, I18n } from "aws-amplify";
import { userFollowCategoryTopic } from "../../graphql/mutations";
import { getAllCategoriesForLanguage } from "../../graphql/queries";
import "./Login.css";
import theme from "../../themes";
import TopicCard from "../TopicCard";

const SubmitButton = styled(Button)`
  border-radius: 50px;
  width: 30%;
  font-size: 1em;
  padding: ${theme.spacing(1.5)};
  margin: ${theme.spacing(2, "auto")};
  color: ${theme.palette.getContrastText("#012144")};
  background-color: #012144;
`;

const StyledImageListItemBar = styled(ImageListItemBar)`
  .MuiImageListItemBar-title {
    overflow: visible;
    white-space: normal;
    overflow-wrap: break-word;
    font-size: 0.8rem;
    text-align: center;
  }
`;

const StyledImageListItem = styled(ImageListItem)`
  .MuiImageListItem-img {
    border-radius: 7px;
    height: 100px;
  }
`;

const SelectTopics = ({ handleNextStep, language }) => {
  const [topics, setTopics] = useState([]);
  const [allSelectedTopics, setAllSelectedTopics] = useState([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  const [image, setImage] = useState([]);
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 3;

  async function queriedData() {
    let categories = await API.graphql(
      graphqlOperation(getAllCategoriesForLanguage, { language: language })
    );
    let allCategories = categories.data.getAllCategoriesForLanguage;
    setTopics(allCategories);
    for (let i = 0; i < allCategories.length; i++) {
      let imageURL = await Storage.get(allCategories[i].picture_location);
      setImage((prev) => [...prev, imageURL]);
    }

    const topicsPageCount =
      allCategories &&
      (allCategories.length % 3 === 0
        ? Math.round(allCategories.length / 3)
        : Math.floor(allCategories.length / 3 + 1));
    setPageCount(topicsPageCount);
  }

  useEffect(() => {
    queriedData();
  }, [language]);

  const displayTopicOptions = () => {
    return (
      topics &&
      topics.length > 0 &&
      topics
        .map((topic, index) => (
          <StyledImageListItem
            key={index}
            sx={{
              width: "100px",
              height: "100px",
              cursor: "pointer",
              "&:hover": {
                opacity: "0.7",
              },
            }}
            onClick={() => setCurrentlySelectedTopic(topic)}
          >
            {topic.picture_location !== null ? (
              <img src={image[index]} alt={topic.title} />
            ) : (
              <Box
                sx={{
                  backgroundColor: "#738DED",
                  width: "100px",
                  height: "100px",
                  borderRadius: "7px",
                }}
              ></Box>
            )}
            <StyledImageListItemBar
              title={
                navigator.language === "fr" ||
                navigator.language.startsWith("fr-")
                  ? topic.title_fr
                  : topic.title
              }
              position="below"
            />
          </StyledImageListItem>
        ))
        .slice((page - 1) * topicsPerPage, page * topicsPerPage)
    );
  };

  async function nextClicked() {
    const allSelectedTopicsTemp = allSelectedTopics;

    for (var i = 0; i < allSelectedTopicsTemp.length; i++) {
      await API.graphql(
        graphqlOperation(userFollowCategoryTopic, allSelectedTopicsTemp[i])
      ).catch((e) => console.log(e));
    }
    handleNextStep();
  }

  // filter the subtopics so that only ones that have been saved
  // are displayed
  function backClicked() {
    const allSelectedTopicsTemp = allSelectedTopics;
    if (
      allSelectedTopicsTemp.filter(
        (s) => s.category_id === currentlySelectedTopic.category_id
      ).length === 0
    ) {
      if (!saveEnabled) {
        let splitSubtopics = [];
        for (let x = 0; x < selectedSubtopics.length; x++) {
          let topicTitle = selectedSubtopics[x].split("/");
          splitSubtopics.push(topicTitle);
        }
        let subtopicsForThisTopic = splitSubtopics.filter(
          (s) => s[0] === currentlySelectedTopic.title
        );
        for (let i = 0; i < subtopicsForThisTopic.length; i++) {
          setSelectedSubtopics((prev) =>
            prev.filter((s) => !s.includes(currentlySelectedTopic.title))
          );
        }
      }
    }
    setCurrentlySelectedTopic();
  }

  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography sx={{ my: "0.5em" }} className={"login-wrapper-top-header"}>
        {I18n.get("selectCategoriesTitle")}
      </Typography>
      <Typography variant="body2">
        {I18n.get("initialCategoriesSelect")}
      </Typography>
      {currentlySelectedTopic ? (
        <Box sx={{ mt: "1em" }}>
          <IconButton
            color="primary"
            aria-label="back to topic options"
            component="label"
            onClick={backClicked}
            sx={{ mb: "0.5em" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TopicCard
            selectedTopic={currentlySelectedTopic}
            setSaveEnabled={setSaveEnabled}
            selectedSubTopics={selectedSubtopics}
            setSelectedSubtopics={setSelectedSubtopics}
            allSelectedTopics={allSelectedTopics}
            setAllSelectedTopics={setAllSelectedTopics}
            language={language}
          />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              height: selectedSubtopics.length > 0 ? "400px" : "200px",
              overflow: "auto",
            }}
          >
            {selectedSubtopics.length > 0 && (
              <Box sx={{ display: "flex", mt: "2em", flexDirection: "column" }}>
                <Typography variant="body2">
                  {I18n.get("currentSelection")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    my: "1em",
                    gap: "0.5em",
                    height: "50px",
                    overflow: "auto",
                  }}
                >
                  {selectedSubtopics.map((subtopic, index) => (
                    <Chip key={index} label={subtopic} />
                  ))}
                </Box>
              </Box>
            )}
            <Box
              sx={{
                display: "grid",
                mt: "2em",
                gridTemplateColumns: {
                  xs: "repeat(3, 1fr)",
                },
                rowGap: 1,
                [`& .${imageListItemClasses.root}`]: {
                  display: "flex",
                  flexDirection: "column",
                },
                justifyItems: "center",
              }}
            >
              {displayTopicOptions()}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                mt: "1em",
              }}
            >
              <Stack spacing={2}>
                <Pagination
                  showFirstButton
                  showLastButton
                  count={pageCount}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  size="small"
                />
              </Stack>
            </Box>
          </Box>
          <SubmitButton
            sx={{ mt: "2em" }}
            variant="contained"
            onClick={nextClicked}
          >
            {I18n.get("next")}
          </SubmitButton>
        </>
      )}
    </Grid>
  );
};

export default SelectTopics;
