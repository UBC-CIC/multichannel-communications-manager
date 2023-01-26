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
  InputAdornment,
} from "@mui/material";
import { Add, Search, Delete } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageListItem, {
  imageListItemClasses,
} from "@mui/material/ImageListItem";
import { API, graphqlOperation, Storage, I18n } from "aws-amplify";
import { getAllCategoriesForLanguage } from "../graphql/queries";
import { styled } from "@mui/material/styles";
import AdminTopicCard from "../components/AdminTopicCard";
import AddTopicDialog from "../components/Dialog/AddTopicDialog";
import DeleteTopicDialog from "../components/Dialog/DeleteTopicDialog";

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

const Admin = ({ language }) => {
  const [topics, setTopics] = useState([]);
  const [topicsTemp, setTopicsTemp] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
  const [openDeleteTopicDialog, setOpenDeleteTopicDialog] = useState(false);
  const [currentlySelectedTopic, setCurrentlySelectedTopic] = useState();
  const [image, setImage] = useState([]);
  //for pagination
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const topicsPerPage = 10;

  async function queriedData() {
    setImage([]);
    let categories = await API.graphql(
      graphqlOperation(getAllCategoriesForLanguage, { language: language })
    );
    let allCategories = categories.data.getAllCategoriesForLanguage;
    if (allCategories !== null) {
      setTopics(allCategories);
      setTopicsTemp(allCategories);
      // Get the images for all the categories
      for (let i = 0; i < allCategories.length; i++) {
        let imageURL = await Storage.get(allCategories[i].picture_location);
        setImage((prev) => [...prev, imageURL]);
      }

      const topicsPageCount =
        allCategories &&
        (allCategories.length % 10 === 0
          ? Math.round(allCategories.length / 10)
          : Math.floor(allCategories.length / 10 + 1));
      setPageCount(topicsPageCount);
    }
  }

  useEffect(() => {
    queriedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  function search() {
    if (searchVal === "") {
      return;
    } else {
      let searchValLowerCase = searchVal.toLowerCase();
      let filteredTopics = topicsTemp.filter((s) =>
        s.title.toLowerCase().includes(searchValLowerCase)
      );
      setTopicsTemp(filteredTopics);
    }
  }

  function onChange(e) {
    setSearchVal(e.target.value);
    if (e.target.value === "") {
      setTopicsTemp(topics);
    }
  }

  function onKeyDownSearch(e) {
    if (e.keyCode === 13) {
      search();
    }
  }

  const displayTopicOptions = () => {
    return (
      topicsTemp &&
      topicsTemp.length > 0 &&
      topicsTemp
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
      <Typography variant="h3" sx={{ mb: "1em" }}>
        {I18n.get("welcome")}
      </Typography>
      {currentlySelectedTopic ? (
        <Box>
          <IconButton
            color="primary"
            aria-label="back to topic options"
            component="label"
            onClick={() => {
              queriedData();
              setCurrentlySelectedTopic();
            }}
            sx={{ mb: "0.5em" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <AdminTopicCard
            selectedTopic={currentlySelectedTopic}
            setSelectedTopic={setCurrentlySelectedTopic}
            language={language}
          />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <TextField
              fullWidth
              placeholder={I18n.get("search")}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={search}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={onChange}
              onKeyDown={onKeyDownSearch}
            />
            <IconButton
              color="primary"
              aria-label="back to topic options"
              component="label"
              onClick={() => setOpenNewTopicDialog(true)}
              sx={{ width: "fit-content", mb: "0.5em" }}
            >
              <Add />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="back to topic options"
              component="label"
              onClick={() => setOpenDeleteTopicDialog(true)}
              sx={{ width: "fit-content", mb: "0.5em" }}
            >
              <Delete />
            </IconButton>
            <AddTopicDialog
              open={openNewTopicDialog}
              handleClose={() => setOpenNewTopicDialog(false)}
              reload={queriedData}
              language={language}
            />
            <DeleteTopicDialog
              open={openDeleteTopicDialog}
              handleClose={() => setOpenDeleteTopicDialog(false)}
              topics={topicsTemp}
              reload={queriedData}
              language={language}
            />
          </Box>
          <Box sx={{ border: 1, borderColor: "grey.400", borderRadius: "6px" }}>
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
                mb: "2em",
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
