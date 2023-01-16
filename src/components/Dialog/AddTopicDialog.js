import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  IconButton,
  Box,
  TextField,
  Select,
  OutlinedInput,
  InputLabel,
  Chip,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Upload, Close, RssFeed } from "@mui/icons-material";
import { API, graphqlOperation, I18n, Storage } from "aws-amplify";
import {
  createCategory,
  createTopic,
  addTopicToCategory,
  addCategoryDisplayLanguage,
  addTopicDisplayLanguage,
} from "../../graphql/mutations";
import { getAllTopicsForLanguage } from "../../graphql/queries";

const AddTopicDialog = ({ open, handleClose, reload, language }) => {
  const [inputFields, setInputFields] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [title, setTitle] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [topicExistsError, setTopicsExistError] = useState(false);
  const [uploadFile, setUploadFile] = useState();
  const [selectedUploadFile, setSelectedUploadFile] = useState("");
  // const [language, setLanguage] = useState(
  //   navigator.language === "fr" || navigator.language.startsWith("fr")
  //     ? "fr"
  //     : "en"
  // );

  useEffect(() => {
    console.log("in start useeffect");
    async function getTopics() {
      console.log("in gettopics");
      const topicsQuery = await API.graphql(
        graphqlOperation(getAllTopicsForLanguage, { language: language })
      );
      const topics = topicsQuery.data.getAllTopicsForLanguage;
      console.log("topics", topics);
      if (topics !== null) {
        const topicsName = topics.map((a) => a.name);
        setAllTopics(topicsName);
        console.log("alltopics", allTopics);
      }
    }
    getTopics();
  }, []);

  const clearFields = () => {
    setInputFields([]);
    setSelectedTopics([]);
    setTitle("");
    setDescription("");
    setTopicsExistError(false);
    handleClose();
    setUploadFile();
    setSelectedUploadFile("");
  };

  const handleAddSubtopic = () => {
    setInputFields([...inputFields, { nameEn: "", nameFr: "" }]);
  };

  const handleRemoveSubtopic = (index) => {
    if (inputFields.length !== 0) {
      const values = [...inputFields];
      values.splice(index, 1);
      setInputFields(values);
    }
    setTopicsExistError(false);
  };

  const handleChangeEn = (event, index) => {
    console.log("in handlechangeen");
    setNewTopic(event.target.value);
    setTopicsExistError(false);
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleChangeFr = (event, index) => {
    // setNewTopic(event.target.value);
    // setTopicsExistError(false);
    console.log("in handlechangefr");

    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleSave = async () => {
    // todo
    if (allTopics.includes(newTopic)) {
      setTopicsExistError(true);
    } else {
      setTopicsExistError(false);
      let s3Key = "";
      if (document.getElementById("uploadFile").value === "") {
        s3Key = null;
      } else {
        await Storage.put(uploadFile.name, uploadFile)
          .then((resp) => (s3Key = resp.key))
          .catch((e) => console.log(e));
      }
      let createdTopic = {
        english_title: title,
        english_description: description,
        picture_location: s3Key,
      };
      try {
        // create the category in the database
        const res = await API.graphql(
          graphqlOperation(createCategory, createdTopic)
        );
        console.log("createCategory response", res);
        const categoryId = res.data.createCategory.category_id;
        // create all the new topics
        for (let i = 0; i < inputFields.length; i++) {
          const response = await API.graphql(
            graphqlOperation(createTopic, {
              english_name: inputFields[i].nameEn,
            })
          );
          console.log("createTopic response", response);
          let r = await API.graphql(
            graphqlOperation(addTopicDisplayLanguage, {
              topic_id: response.data.createTopic.topic_id,
              language: "fr",
              name: inputFields[i].nameFr,
            })
          );
          console.log("addTopicDisplayLanguage response", r);
          let r2 = await API.graphql(
            graphqlOperation(addTopicToCategory, {
              category_id: categoryId,
              topic_id: response.data.createTopic.topic_id,
            })
          );
          console.log("addTopicToCategory response", r2);
        }
        let newSubtopics = inputFields.map((a) => a.nameEn);
        let allSubtopics = newSubtopics.concat(selectedTopics);
        // add all the topics to the category
        // for (let i = 0; i < allSubtopics.length; i++) {
        //   await API.graphql(
        //     graphqlOperation(addTopicToCategory, {
        //       category_id: categoryId,
        //       topic_id: allSubtopics[i],
        //     })
        //   );
        // }
        // todo
        // add the French display translations
        // await API.graphql(graphqlOperation(addCategoryDisplayLanguage, {category_id: res.}));
        clearFields();
        reload();

        // add French translations in the database
        let r3 = await API.graphql(
          graphqlOperation(addCategoryDisplayLanguage, {
            category_id: categoryId,
            language: "fr",
            title: titleFr,
            description: descriptionFr,
          })
        );
        console.log("addCategoryDisplayLanguage response", r3);
      } catch (e) {
        console.log("e", e);
      }
    }
  };

  const handleSelectedTopics = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedTopics(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  async function handleUploadFileChange(e) {
    const chosenUploadFile = e.target.files[0];
    setSelectedUploadFile(chosenUploadFile.name);
    setUploadFile(chosenUploadFile);
  }

  return (
    <Dialog
      PaperProps={{
        sx: {
          width: "50%",
          maxHeight: "80%",
        },
      }}
      open={open}
    >
      <DialogTitle id="customized-dialog-title">
        {I18n.get("createCategory")}
        <IconButton
          aria-label="close"
          onClick={clearFields}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginTop: 1,
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
            <Box width={"40%"}>
              <TextField
                InputLabelProps={{ shrink: true }}
                inputProps={{ maxLength: 49 }}
                size="small"
                type="text"
                label={I18n.get("titleEn")}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>
            {/* <Box width={"20%"}>
              <TextField
                InputLabelProps={{ shrink: true }}
                inputProps={{ maxLength: 29 }}
                size="small"
                type="text"
                label={I18n.get("acronym")}
                onChange={(e) => setAcronym(e.target.value)}
              />
            </Box> */}
            <Button
              size="small"
              component="label"
              variant="outlined"
              startIcon={<Upload />}
            >
              {selectedUploadFile ? selectedUploadFile : I18n.get("uploadImg")}
              <input
                type="file"
                id="uploadFile"
                accept="image/png, image/jpeg"
                hidden
                onChange={handleUploadFileChange}
              />
            </Button>
          </Box>

          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label={I18n.get("descriptionEn")}
            multiline
            rows={5}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box width={"40%"}>
            <TextField
              InputLabelProps={{ shrink: true }}
              inputProps={{ maxLength: 49 }}
              size="small"
              type="text"
              label={I18n.get("titleFr") + " *"}
              onChange={(e) => setTitleFr(e.target.value)}
            />
          </Box>
          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label={I18n.get("descriptionFr")}
            multiline
            rows={5}
            onChange={(e) => setDescriptionFr(e.target.value)}
          />
          <FormControl>
            <InputLabel>{I18n.get("selectTopic")}</InputLabel>
            <Select
              multiple
              value={selectedTopics}
              onChange={handleSelectedTopics}
              input={<OutlinedInput label="Select an existing topic" />}
              // todo
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {allTopics === null ? (
                <>hull</>
              ) : (
                allTopics.map((topic) => (
                  <MenuItem key={topic} value={topic}>
                    {topic}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {inputFields.map((item, index) => (
            <div key={index}>
              <InputRow
                inputFields={inputFields}
                index={index}
                item={item}
                handleChangeEn={handleChangeEn}
                handleChangeFr={handleChangeFr}
                handleRemove={handleRemoveSubtopic}
                error={topicExistsError}
                helperText={!!topicExistsError && "This topic already exists."}
              />
            </div>
          ))}
          <Button sx={{ width: "fit-content" }} onClick={handleAddSubtopic}>
            {I18n.get("addTopic")}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={clearFields}>
          {I18n.get("cancel")}
        </Button>
        <Button autoFocus onClick={handleSave}>
          {I18n.get("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// The textfield for all the new topics the user is adding
const InputRow = ({
  index,
  item,
  handleChangeEn,
  handleChangeFr,
  handleRemove,
  error,
  helperText,
}) => {
  return (
    <Box>
      <TextField
        size="small"
        name="nameEn"
        InputLabelProps={{ shrink: true }}
        // todo
        label="Topic Name in English"
        onChange={(event) => handleChangeEn(event, index)}
        value={item.nameEn}
        error={error}
        helperText={helperText}
      />
      <TextField
        size="small"
        name="nameFr"
        InputLabelProps={{ shrink: true }}
        label="Topic Name in French"
        onChange={(event) => handleChangeFr(event, index)}
        value={item.nameFr}
        error={error}
        helperText={helperText}
      />
      <IconButton onClick={handleRemove}>
        <Close />
      </IconButton>
    </Box>
  );
};

export default AddTopicDialog;
