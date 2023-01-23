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
  addTopicDisplayLanguage,
} from "../graphql/mutations";
import "./TopicCard.css";
import EditTopicDialog from "./Dialog/EditTopicDialog";
import { I18n } from "aws-amplify";

const AdminTopicCard = ({ selectedTopic, setSelectedTopic, language }) => {
  const [topicDisplayLanguage, setTopicDisplayLanguage] = useState(language);
  const { title, description, picture_location } = selectedTopic;
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedSubTopics, setSelectedSubtopics] = useState([]);
  const [isRotated, setIsRotated] = useState(false);
  const [invalidInputErrorEn, setInvalidInputErrorEn] = useState(false);
  const [invalidInputErrorMsgEn, setInvalidInputErrorMsgEn] = useState("");
  const [invalidInputErrorFr, setInvalidInputErrorFr] = useState(false);
  const [invalidInputErrorMsgFr, setInvalidInputErrorMsgFr] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopicEn, setNewSubtopicEn] = useState("");
  const [newSubtopicFr, setNewSubtopicFr] = useState("");

  const [image, setImage] = useState("");
  // const [language, setLanguage] = useState(
  //   navigator.language === "fr" || navigator.language.startsWith("fr")
  //     ? "fr"
  //     : "en"
  // );

  async function getSubtopics() {
    let queriedTopics = await API.graphql(
      graphqlOperation(getTopicsOfCategory, {
        category_id: selectedTopic.category_id,
        language: language,
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

  // useEffect(() => {
  //   setTopicDisplayLanguage(language);
  // }, [language]);

  //updates setSelectedSubtopics every time subtopics are selected/unselected by user
  const handleChange = (e, subtopic) => {
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, subtopic.topic_id]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== subtopic.topic_id)
      );
    }
  };

  const handleDelete = async () => {
    for (let i = 0; i < selectedSubTopics.length; i++) {
      await API.graphql(
        graphqlOperation(deleteCategoryTopic, {
          category_id: selectedTopic.category_id,
          topic_id: selectedSubTopics[i],
        })
      );
      setSubtopics((prev) =>
        prev.filter((s) => !(s.topic_id === selectedSubTopics[i]))
      );
    }
  };

  const addTopic = async () => {
    if (newSubtopicEn === "" || newSubtopicFr === "") {
      console.log("100");
      if (newSubtopicEn === "") {
        setInvalidInputErrorEn(true);
        setInvalidInputErrorMsgEn(I18n.get("missingValue"));
      }
      if (newSubtopicFr === "") {
        setInvalidInputErrorFr(true);
        setInvalidInputErrorMsgFr(I18n.get("missingValue"));
      }
    } else {
      console.log("110");
      // Create the topic and add it to the selected category
      await API.graphql(
        graphqlOperation(createTopic, { english_name: newSubtopicEn })
      )
        .then(async (res) => {
          await API.graphql(
            graphqlOperation(addTopicDisplayLanguage, {
              topic_id: res.data.createTopic.topic_id,
              language: "fr",
              name: newSubtopicFr,
            })
          );
          await API.graphql(
            graphqlOperation(addTopicToCategory, {
              category_id: selectedTopic.category_id,
              topic_id: res.data.createTopic.topic_id,
            })
          );
          setSubtopics([...subtopics, { name: newSubtopicEn }]);
        })
        .catch((e) => {
          console.log("e", e);
          const errorMsg = e.errors[0].message;
          if (errorMsg.includes("ER_DUP_ENTRY")) {
            setInvalidInputErrorEn(true);
            setInvalidInputErrorMsgEn(I18n.get("topicExistsErr"));
            setInvalidInputErrorFr(true);
            setInvalidInputErrorMsgFr(I18n.get("topicExistsErr"));
          }
        });
    }
  };

  const handleNewTopicEn = (e) => {
    setInvalidInputErrorEn(false);
    setInvalidInputErrorMsgEn("");
    setNewSubtopicEn(e.target.value);
  };

  const handleNewTopic = (e) => {
    setInvalidInputErrorFr(false);
    setInvalidInputErrorMsgFr("");
    setNewSubtopicFr(e.target.value);
  };

  //renders front of the card displaying category information
  const renderCardFront = () => {
    return (
      <>
        <Card>
          <CardHeader
            title={title}
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
              {description}
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
              title={title}
              titleTypographyProps={{
                fontSize: "1.2rem",
                fontWeight: "400",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <TextField
              size="small"
              label={newSubtopicEn === "" ? I18n.get("addEn") : ""}
              InputLabelProps={{ shrink: false }}
              error={invalidInputErrorEn}
              helperText={invalidInputErrorMsgEn}
              onChange={handleNewTopicEn}
            />
            <TextField
              size="small"
              label={newSubtopicFr === "" ? I18n.get("addFr") : ""}
              InputLabelProps={{ shrink: false }}
              error={invalidInputErrorFr}
              helperText={invalidInputErrorMsgFr}
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
                checked={selectedSubTopics.includes(subtopic.topic_id)}
                label={subtopic.name}
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
