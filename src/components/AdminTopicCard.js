import {
  Card,
  CardHeader,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
  CardActions,
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { API, graphqlOperation, Storage } from "aws-amplify";
import { getTopicsOfCategory } from "../graphql/queries";
import {
  createTopic,
  addTopicToCategory,
  deleteCategoryTopic,
} from "../graphql/mutations";
import "./TopicCard.css";
import EditTopicDialog from "./Dialog/EditTopicDialog";
import { I18n } from "aws-amplify";

const AdminTopicCard = ({ selectedTopic, setSelectedTopic }) => {
  const { title, title_fr, description, description_fr, picture_location } =
    selectedTopic;
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedSubTopics, setSelectedSubtopics] = useState([]);
  const [isRotated, setIsRotated] = useState(false);
  const [invalidInputError, setInvalidInputError] = useState(false);
  const [invalidInputErrorMsg, setInvalidInputErrorMsg] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState("");
  const [image, setImage] = useState("");

  async function getSubtopics() {
    let queriedTopics = await API.graphql(
      graphqlOperation(getTopicsOfCategory, {
        category_acronym: selectedTopic.acronym,
      })
    );
    let onlyTopics = queriedTopics.data.getTopicsOfCategory;
    let topics = onlyTopics;
    // .map((a) => a.acronym);
    setSubtopics(topics);
  }

  useEffect(() => {
    getSubtopics();
    async function getCategoryImage() {
      let imageURL = await Storage.get(picture_location);
      setImage(imageURL);
    }
    getCategoryImage();
  }, []);

  //updates setSelectedSubtopics every time subtopics are selected/unselected by user
  const handleChange = (e, subtopic) => {
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, subtopic]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) => prev.filter((s) => s !== subtopic));
    }
  };

  const handleDelete = async () => {
    for (let i = 0; i < selectedSubTopics.length; i++) {
      await API.graphql(
        graphqlOperation(deleteCategoryTopic, {
          category_acronym: selectedTopic.acronym,
          topic_acronym: selectedSubTopics[i],
        })
      );
      setSubtopics((prev) => prev.filter((s) => !(s === selectedSubTopics[i])));
    }
  };

  const addTopic = async () => {
    if (newSubtopic === "") {
      setInvalidInputError(true);
      setInvalidInputErrorMsg(I18n.get("missingValue"));
    } else {
      // Create the topic and add it to the selected category
      await API.graphql(graphqlOperation(createTopic, { acronym: newSubtopic }))
        .then(async () => {
          await API.graphql(
            graphqlOperation(addTopicToCategory, {
              category_acronym: selectedTopic.acronym,
              topic_acronym: newSubtopic,
            })
          );
          setSubtopics([...subtopics, newSubtopic]);
        })
        .catch((e) => {
          const errorMsg = e.errors[0].message;
          if (
            errorMsg.includes(
              "ER_DUP_ENTRY: Duplicate entry 'Jobs' for key 'acronym'"
            )
          ) {
            setInvalidInputError(true);
            setInvalidInputErrorMsg(I18n.get("topicExistsErr"));
          }
        });
    }
  };

  const handleNewTopic = (e) => {
    setInvalidInputError(false);
    setInvalidInputErrorMsg("");
    setNewSubtopic(e.target.value);
  };

  //renders front of the card displaying category information
  const renderCardFront = () => {
    return (
      <>
        <Card>
          <CardHeader
            title={
              navigator.language === "fr" ||
              navigator.language.startsWith("fr-")
                ? title_fr
                : title
            }
            titleTypographyProps={{
              fontSize: "1.2rem",
              fontWeight: "400",
            }}
          />
          {picture_location !== null ? (
            <CardMedia
              component={"img"}
              image={image}
              sx={{ objectFit: "fill" }}
              height="150"
            />
          ) : (
            <Box
              sx={{
                backgroundColor: "#738DED",
                height: "120px",
                width: "100%",
              }}
            />
          )}
          <CardContent sx={{ p: "16px 16px 0px 16px" }}>
            <Typography variant="body2" color="text.secondary">
              {navigator.language === "fr" ||
              navigator.language.startsWith("fr-")
                ? description_fr
                : description}
            </Typography>
          </CardContent>
          <CardActions
            disableSpacing
            sx={{ justifyContent: "flex-end", pt: "0px" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                sx={{ mr: "1em" }}
                onClick={() => setIsRotated(!isRotated)}
              >
                {I18n.get("viewTopics")}
              </Button>
              <IconButton
                aria-label="subscribe to topic"
                onClick={() => setOpenEditDialog(true)}
              >
                <Edit />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
        <EditTopicDialog
          open={openEditDialog}
          handleClose={() => setOpenEditDialog(false)}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
        />
      </>
    );
  };

  // renders the back of the card displaying all of the topics
  const renderCardBack = () => {
    return (
      <Card>
        <Box
          sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <Box width={"100%"}>
            <CardHeader
              title={
                navigator.language === "fr" ||
                navigator.language.startsWith("fr-")
                  ? title_fr
                  : title
              }
              titleTypographyProps={{
                fontSize: "1.2rem",
                fontWeight: "400",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <TextField
              size="small"
              label={newSubtopic === "" ? I18n.get("add") : ""}
              InputLabelProps={{ shrink: false }}
              error={invalidInputError}
              helperText={invalidInputErrorMsg}
              onChange={handleNewTopic}
            />
            <IconButton onClick={addTopic}>
              <Add />
            </IconButton>
          </Box>
        </Box>
        <CardContent sx={{ p: "16px 16px 0px 16px" }}>
          <FormGroup>
            {subtopics.map((subtopic, index) => (
              <FormControlLabel
                key={index}
                control={<Checkbox />}
                checked={selectedSubTopics.includes(subtopic.acronym)}
                label={subtopic}
                onChange={(e) => handleChange(e, subtopic)}
              />
            ))}
          </FormGroup>
        </CardContent>
        <CardActions
          disableSpacing
          sx={{ justifyContent: "flex-end", pt: "0px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button sx={{ mr: "1em" }} onClick={handleDelete}>
              {I18n.get("delete")}
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <div className={`card ${isRotated ? "rotated" : ""}`}>
      {!isRotated ? (
        <div className="front">{renderCardFront()}</div>
      ) : (
        <div className="back">{renderCardBack()}</div>
      )}
    </div>
  );
};

export default AdminTopicCard;
