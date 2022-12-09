import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ImageListItemBar,
  Grid,
  Stack,
  Pagination,
  IconButton,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageListItem, {
  imageListItemClasses,
} from "@mui/material/ImageListItem";
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { getAllCategories, getCategoriesByUserId, getUserByEmail } from "../../graphql/queries";
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
  const [sampleTopics, setSampleTopics] = useState([]);
  const [topics, setTopics] = useState([])
  const [userData, setUserData] = useState([]);
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  const [image, setImage] = useState([])
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 10;

  async function getCategoryImages(categories) {
    for (let i = 0; i < categories.length; i++) {
      let imageURL = await Storage.get(categories[i].picture_location)
      setImage((prev) => [...prev, imageURL])
    }  
  }

  async function queriedData() {
    let categories = await API.graphql(graphqlOperation(getAllCategories));
    let allCategories = categories.data.getAllCategories;
    setTopics(allCategories)
    setSampleTopics(allCategories);
    getCategoryImages(allCategories) 
    
    const topicsPageCount =
    allCategories &&
      (allCategories.length % 10 === 0
        ? Math.round(allCategories.length / 10)
        : Math.floor(allCategories.length / 10 + 1));
    setPageCount(topicsPageCount);
  }

  async function userSubscribedData() {
    const returnedUser = await Auth.currentAuthenticatedUser();
    let getUserId = await API.graphql(graphqlOperation(getUserByEmail, {
      user_email: returnedUser.attributes.email
    }))
    let categories = await API.graphql(graphqlOperation(getCategoriesByUserId, {
      user_id: getUserId.data.getUserByEmail.user_id
    }));
    let noDuplicates = categories.data.getCategoriesByUserId.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.acronym === value.acronym
        ))
      )
    setUserData(noDuplicates);
  }

  //updates pagination
  useEffect(() => {
    queriedData();
    userSubscribedData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlySelectedTopic]);

  const handleCheck = async (e) => {
    setImage([])
    if (e.target.checked) {
      getCategoryImages(userData)
      setSampleTopics(userData)
    } else {
      getCategoryImages(topics)
      setSampleTopics(topics)
    }
  }

  const displayTopicOptions = () => {
    return (
      sampleTopics &&
      sampleTopics.length > 0 &&
      sampleTopics
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
            {topic.picture_location !== null ? 
              <img src={image[index]} alt={topic.title} /> :
              <Box
              sx={{
                backgroundColor: "#738DED",
                width: "100px",
                height: "100px",
                borderRadius: "7px",
              }}
            ></Box>}
            <StyledImageListItemBar title={topic.title} position="below" />
          </StyledImageListItem>
        ))
        .slice((page - 1) * topicsPerPage, page * topicsPerPage)
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
        Select categories of interest that you would like to receive notifications
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
          <ViewTopicsCard selectedTopic={currentlySelectedTopic} />
        </Box>
      ) : (
        <>
          <FormControlLabel 
            control={<Checkbox onChange={handleCheck} />}
            label="Show user subscribed categories" 
            />
            <Box sx={{border: 1, borderColor: "grey.400", borderRadius: '6px' }}>
          <Box
            sx={{
              display: "grid",
              mt: "2em",
              gridTemplateColumns: {
                xs: "repeat(2, 2fr)",
                sm: "repeat(3, 2fr)",
                md: "repeat(5, 2fr)",
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
        </>
      )}
    </Grid>
  );
};

export default ViewTopics;
