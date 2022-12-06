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
import { Auth, API, graphqlOperation } from "aws-amplify";
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
  const [sampleTopics, setSampleTopics] = useState([]);

  //this state is unused for now, but is for later to update the user form with all the topics they've selected during the sign up process
  const [topics, setTopics] = useState([])
  const [allSelectedTopics, setAllSelectedTopics] = useState();
  const [userData, setUserData] = useState([]);
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 10;

  async function queriedData() {
    let categories = await API.graphql(graphqlOperation(getAllCategories));
    let allCategories = categories.data.getAllCategories;
    setTopics(allCategories)
    setSampleTopics(allCategories);
  }

  async function userSubscribedData() {
    const returnedUser = await Auth.currentAuthenticatedUser();
    let getUserId = await API.graphql(graphqlOperation(getUserByEmail, {
      user_email: returnedUser.attributes.email
    }))
    let categories = await API.graphql(graphqlOperation(getCategoriesByUserId, {
      user_id: getUserId.data.getUserByEmail.user_id
    }));
    let allUserCategories = categories.data.getCategoriesByUserId;
    setUserData(allUserCategories);
  }

  //updates pagination
  useEffect(() => {
    queriedData();
    userSubscribedData()
    //change this to use queried data later
    const topicsPageCount =
    topics &&
      (topics.length % 10 === 0
        ? Math.round(topics.length / 10)
        : Math.floor(topics.length / 10 + 1));
    setPageCount(topicsPageCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = (e) => {
    if (e.target.checked) {
      setSampleTopics(userData)
    } else {
      setSampleTopics(topics)
    }
  }

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
