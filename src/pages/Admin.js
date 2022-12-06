import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ImageListItemBar,
  Grid,
  Stack,
  Pagination,
  TextField,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Add, Search, Delete } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageListItem, {
  imageListItemClasses,
} from "@mui/material/ImageListItem";
import { API, graphqlOperation } from "aws-amplify"
import { getAllCategories } from "../graphql/queries";
import { styled } from "@mui/material/styles";
import AdminTopicCard from "../components/AdminTopicCard";
import AddTopicDialog from "../components/AddTopicDialog";
import DeleteTopicDialog from "../components/DeleteTopicDialog";

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

const Admin = () => {
  //hard coded mock data for now, to be replaced with queried data
  const sampleTopics = [
    {
      title: "Health",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      title: "Insolvency",
      description:
        "Consumer proposals, bankruptcy and how to find a Licensed Insolvency Trustee.",
    },
    {
      title: "Money and Finances",
      description:
        "Managing your money, debt and investments, planning for retirement and protecting yourself from consumer fraud.",
    },
    {
      title: "Federal Corporations",
      description:
        "Incorporating or making changes to a business corporation, not-for-profit, cooperative or board of trade.",
    },
    {
      title: "Sample 5",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      title: "Sample 6",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      title: "Sample 7",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      title: "Sample 8",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      title: "Sample 9",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
  ];

  //this state is unused for now, but is for later to update the user form with all the topics they've selected during the sign up process
  const [topics, setTopics] = useState([])
  const [topicsTemp, setTopicsTemp] = useState([])
  const [searchVal, setSearchVal] = useState("");
  const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false)
  const [openDeleteTopicDialog, setOpenDeleteTopicDialog] = useState(false)
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 10;

  async function queriedData() {
    let categories = await API.graphql(graphqlOperation(getAllCategories))
    let allCategories = categories.data.getAllCategories
    setTopics(allCategories)
    setTopicsTemp(allCategories)
  }

  //updates pagination
  useEffect(() => {
    queriedData()
    //change this to use queried data later
    const topicsPageCount =
    topicsTemp &&
      (topicsTemp.length % 10 === 0
        ? Math.round(topicsTemp.length / 10)
        : Math.floor(topicsTemp.length / 10 + 1));
    setPageCount(topicsPageCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  const handleAddNewTopicOpen = () => {
    setOpenNewTopicDialog(true)
  }

  const handleAddNewTopicClose = () => {
    setOpenNewTopicDialog(false)
  }

  const handleDeleteTopicOpen = () => {
    setOpenDeleteTopicDialog(true)
  }

  const handleDeleteTopicClose = () => {
    setOpenDeleteTopicDialog(false)
  }

  function search() {
    if (searchVal === "") {
      return;
    } else {
      let searchValLowerCase = searchVal.toLowerCase()
      let filteredTopics = topicsTemp.filter((s) => s.title.toLowerCase().includes(searchValLowerCase))
      setTopicsTemp(filteredTopics)
    }
  }
  
  function onChange(e) {
    setSearchVal(e.target.value)
    if (e.target.value === "") {
      setTopicsTemp(topics)
    }
  }

  function onKeyDownSearch(e) {
    if (e.keyCode === 13) {
      search()
    }
  }

  const displayTopicOptions = () => {
    return (
      topicsTemp &&
      topicsTemp.length > 0 &&
      topicsTemp
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
      <Typography variant="h3" sx={{ mb: "1em" }}>
        Welcome!
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
          <AdminTopicCard
            selectedTopic={currentlySelectedTopic}
            setSelectedTopic={setCurrentlySelectedTopic}
          />
        </Box>
      ) : (
        <>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <TextField
              fullWidth
              placeholder="Search..."
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={search}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onChange={onChange}
              onKeyDown={onKeyDownSearch}
            />
              <IconButton
                color="primary"
                aria-label="back to topic options"
                component="label"
                onClick={handleAddNewTopicOpen}
                sx={{ width: 'fit-content', mb: "0.5em" }}
              >
                <Add />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="back to topic options"
                component="label"
                onClick={handleDeleteTopicOpen}
                sx={{ width: 'fit-content', mb: "0.5em" }}
              >
                <Delete />
              </IconButton>
              <AddTopicDialog 
                open={openNewTopicDialog}
                handleClose={handleAddNewTopicClose}
                />
              <DeleteTopicDialog 
                open={openDeleteTopicDialog}
                handleClose={handleDeleteTopicClose}
                topics={topicsTemp}
                setTopics={setTopicsTemp}
                />
            </Box>
          <Box sx={{border: 1, borderColor: "grey.400", borderRadius: '6px' }}>
            <Box
              sx={{
                display: "grid",
                mt: "2em",
                gridTemplateColumns: {
                  xs: "repeat(2, 2fr)",
                  sm: "repeat(3, 2fr)",
                  md: "repeat(5, 2fr)"
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
                mb: "2em"
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

export default Admin;
