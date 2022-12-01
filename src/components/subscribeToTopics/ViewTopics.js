import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ImageListItemBar,
  Grid,
  Stack,
  Pagination,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageListItem, {
  imageListItemClasses,
} from "@mui/material/ImageListItem";
import { API, graphqlOperation } from "aws-amplify"
import { getAllCategories } from "../../graphql/queries";
import { styled } from "@mui/material/styles";
import ViewTopicsCard from "./ViewTopicsCard";

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

const ViewTopics = () => {
  //hard coded mock data for now, to be replaced with queried data
  // const sampleTopics = [
  //   {
  //     title: "Health",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  //   {
  //     title: "Insolvency",
  //     description:
  //       "Consumer proposals, bankruptcy and how to find a Licensed Insolvency Trustee.",
  //   },
  //   {
  //     title: "Money and Finances",
  //     description:
  //       "Managing your money, debt and investments, planning for retirement and protecting yourself from consumer fraud.",
  //   },
  //   {
  //     title: "Federal Corporations",
  //     description:
  //       "Incorporating or making changes to a business corporation, not-for-profit, cooperative or board of trade.",
  //   },
  //   {
  //     title: "Sample 5",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  //   {
  //     title: "Sample 6",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  //   {
  //     title: "Sample 7",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  //   {
  //     title: "Sample 8",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  //   {
  //     title: "Sample 9",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //   },
  // ];

  //this state is unused for now, but is for later to update the user form with all the topics they've selected during the sign up process
  const [sampleTopics, setSampleTopics] = useState([])
  const [allSelectedTopics, setAllSelectedTopics] = useState();
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 8;

  async function queriedData() {
    let categories = await API.graphql(graphqlOperation(getAllCategories))
    let allCategories = categories.data.getAllCategories
    setSampleTopics(allCategories)
  }

  //updates pagination
  useEffect(() => {
    queriedData()
    //change this to use queried data later
    const topicsPageCount =
      sampleTopics &&
      (sampleTopics.length % 8 === 0
        ? Math.round(sampleTopics.length / 8)
        : Math.floor(sampleTopics.length / 8 + 1));
    setPageCount(topicsPageCount);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayTopicOptions = () => {
    return (
      sampleTopics &&
      sampleTopics.length > 0 &&
      sampleTopics
        .slice((page - 1) * topicsPerPage, page * topicsPerPage)
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
            <Box
              sx={{
                backgroundColor: "#738DED",
                width: "100px",
                height: "100px",
                borderRadius: "7px",
              }}
            ></Box>
            <StyledImageListItemBar title={topic.title} position="below" />
          </StyledImageListItem>
        ))
    );
  };

  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography variant="body1" sx={{ mb: "2em" }}>
        Select topics of interest that you would like to receive notifications
        from. Your notification preferences can be changed at any time.
      </Typography>

      {currentlySelectedTopic ? (
        <Box>
          <IconButton
            color="primary"
            aria-label="back to topic options"
            component="label"
            onClick={() => setCurrentlySelectedTopic()}
            sx={{ mb: "0.5em" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <ViewTopicsCard
            selectedTopic={currentlySelectedTopic}
            selectedSubTopics={selectedSubtopics}
            setSelectedSubtopics={setSelectedSubtopics}
          />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              mt: "2em",
              gridTemplateColumns: {
                xs: "repeat(4, 2fr)",
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
        </>
      )}
    </Grid>
  );
};

export default ViewTopics;
