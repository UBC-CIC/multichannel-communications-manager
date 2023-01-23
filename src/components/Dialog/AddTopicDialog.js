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
import {
  Upload,
  Close,
  RssFeed,
  ConnectingAirportsOutlined,
} from "@mui/icons-material";
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
  const [topicExistsError, setTopicExistError] = useState(false);
  const [topicNullError, setTopicsNullError] = useState(false);
  const [invalidInputErrorEn, setInvalidInputErrorEn] = useState(false);
  // const [invalidInputErrorMsgEn, setInvalidInputErrorMsgEn] = useState("");
  const [invalidInputErrorFr, setInvalidInputErrorFr] = useState(false);
  // const [invalidInputErrorMsgFr, setInvalidInputErrorMsgFr] = useState("");
  const [uploadFile, setUploadFile] = useState();
  const [selectedUploadFile, setSelectedUploadFile] = useState("");
  // const [language, setLanguage] = useState(
  //   navigator.language === "fr" || navigator.language.startsWith("fr")
  //     ? "fr"
  //     : "en"
  // );

  useEffect(() => {
    async function getTopics() {
      const topicsQuery = await API.graphql(
        graphqlOperation(getAllTopicsForLanguage, { language: language })
      );
      const topics = topicsQuery.data.getAllTopicsForLanguage;
      if (topics !== null) {
        const topicsName = topics.map((a) => a.name);
        // setAllTopics(topicsName);
        setAllTopics(topics);
      }
    }
    getTopics();
  }, [language]);

  const clearFields = () => {
    setInputFields([]);
    setSelectedTopics([]);
    setTitle("");
    setDescription("");
    setTitleFr("");
    setDescriptionFr("");
    setTopicExistError(false);
    setTopicsNullError(false);
    setInvalidInputErrorEn(false);
    setInvalidInputErrorFr(false);
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
    setTopicExistError(false);
    setTopicsNullError(false);
  };

  const handleChangeEn = (event, index) => {
    setNewTopic(event.target.value);
    setTopicExistError(false);
    setTopicsNullError(false);
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleChangeFr = (event, index) => {
    // setNewTopic(event.target.value);
    // setTopicsExistError(false);

    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleSave = async () => {
    if (title === "" || titleFr === "") {
      title === ""
        ? setInvalidInputErrorEn(true)
        : setInvalidInputErrorEn(false);
      titleFr === ""
        ? setInvalidInputErrorFr(true)
        : setInvalidInputErrorFr(false);
      // } else if (allTopics.map((t) => t.name).includes(newTopic)) {
      //   console.log("alltopics", allTopics);
      //   console.log("newtopic", newTopic);

      //   console.log("139");

      // setTopicExistError(true);
    } else {
      setInvalidInputErrorEn(false);
      setInvalidInputErrorFr(false);
      setTopicExistError(false);
      setTopicsNullError(false);
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
        // create all the new topics
        // for (let i = 0; i < inputFields.length; i++) {
        //   if (inputFields[i].nameEn != "" && inputFields[i].nameFr != "") {
        //     const response = await API.graphql(
        //       graphqlOperation(createTopic, {
        //         english_name: inputFields[i].nameEn,
        //       })
        //     );

        //     console.log("createTopic response", response);
        //     let r = await API.graphql(
        //       graphqlOperation(addTopicDisplayLanguage, {
        //         topic_id: response.data.createTopic.topic_id,
        //         language: "fr",
        //         name: inputFields[i].nameFr,
        //       })
        //     );
        //     console.log("addTopicDisplayLanguage response", r);
        //     let r2 = await API.graphql(
        //       graphqlOperation(addTopicToCategory, {
        //         category_id: categoryId,
        //         topic_id: response.data.createTopic.topic_id,
        //       })
        //     );
        //     console.log("addTopicToCategory response", r2);
        //   }
        // }
        // let newSubtopics = inputFields;
        // .map((a) => a.nameEn);
        // let allSubtopics = newSubtopics.concat(selectedTopics);

        // create the category in the database
        const res = await API.graphql(
          graphqlOperation(createCategory, createdTopic)
        );
        let categoryId = res.data.createCategory.category_id;

        // add all the selected topics to the category
        // for (let i = 0; i < selectedTopics.length; i++) {
        //   await API.graphql(
        //     graphqlOperation(addTopicToCategory, {
        //       category_id: categoryId,
        //       topic_id: selectedTopics[i].topic_id,
        //     })
        //   );
        // }
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
      } catch (e) {
        console.log("e", e);
        const errorMsg = e.errors[0].message;
        if (errorMsg.includes("ER_DUP_ENTRY: Duplicate entry")) {
          setTopicExistError(true);
        }
        if (
          errorMsg.includes("ER_BAD_NULL_ERROR: Column 'name' cannot be null")
        ) {
          setTopicsNullError(true);
        }
      }
    }
  };
  // };

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
                error={invalidInputErrorEn}
                helperText={!!invalidInputErrorEn && I18n.get("missingValue")}
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
              error={invalidInputErrorFr}
              helperText={!!invalidInputErrorFr && I18n.get("missingValue")}
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
          {/* todo */}
          {/* <FormControl>
            <InputLabel>{I18n.get("selectTopic")}</InputLabel>
            <Select
              multiple
              value={selectedTopics.map((t) => t.name)}
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
                <></>
              ) : (
                allTopics.map((topic) => (
                  <MenuItem key={topic.name} value={topic}>
                    {topic.name}
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
                error={topicExistsError || topicNullError}
                // todo
                helperText={
                  !!topicExistsError
                    ? "This topic already exists."
                    : !!topicNullError
                    ? "Must enter a name for the topic"
                    : false
                }
              />
            </div>
          ))}
          <Button sx={{ width: "fit-content" }} onClick={handleAddSubtopic}>
            {I18n.get("addTopic")}
          </Button> */}
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
        label={I18n.get("topicEn")}
        onChange={(event) => handleChangeEn(event, index)}
        value={item.nameEn}
        error={error}
        helperText={helperText}
      />
      <TextField
        size="small"
        name="nameFr"
        InputLabelProps={{ shrink: true }}
        label={I18n.get("topicFr")}
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
