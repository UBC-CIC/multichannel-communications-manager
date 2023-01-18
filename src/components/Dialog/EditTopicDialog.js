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
} from "@mui/material";
import { Close, Upload } from "@mui/icons-material";
import { API, graphqlOperation, I18n, Storage } from "aws-amplify";
import { updateCategoryInfo, updateCategory } from "../../graphql/mutations";
import { getCategory } from "../../graphql/queries";

const EditTopicDialog = ({
  open,
  handleClose,
  selectedTopic,
  setSelectedTopic,
}) => {
  const [newTitleEn, setNewTitleEn] = useState(selectedTopic.title);
  const [newTitleFr, setNewTitleFr] = useState("");

  const [newDescriptionEn, setNewDescriptionEn] = useState(
    selectedTopic.description
  );
  const [newDescriptionFr, setNewDescriptionFr] = useState("");
  const [uploadFile, setUploadFile] = useState();
  const [selectedUploadFile, setSelectedUploadFile] = useState("");

  const handleSave = async () => {
    let s3Key = "";
    console.log("35");
    if (document.getElementById("uploadFile").value === "") {
      s3Key = null;
      console.log("37");
    } else {
      console.log("38");
      await Storage.put(uploadFile.name, uploadFile).then(
        (resp) => (s3Key = resp.key)
      );
      console.log("41");
    }
    try {
      console.log("43");
      await API.graphql(
        // update english content
        graphqlOperation(updateCategoryInfo, {
          category_id: selectedTopic.category_id,
          language: "en",
          title: newTitleEn,
          description: newDescriptionEn,
        })
      );
      console.log("53");
      await API.graphql(
        // update french content
        graphqlOperation(updateCategoryInfo, {
          category_id: selectedTopic.category_id,
          language: "fr",
          title: newTitleFr,
          description: newDescriptionFr,
        })
      );
      console.log("63");
      // todo
      if (s3Key) {
        await API.graphql(
          // update img
          graphqlOperation(updateCategory, {
            category_id: selectedTopic.category_id,
            picture_location: s3Key,
          })
        );
      }
      console.log("s3 key", s3Key);
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };

  async function handleUploadFileChange(e) {
    const chosenUploadFile = e.target.files[0];
    setSelectedUploadFile(chosenUploadFile.name);
    setUploadFile(chosenUploadFile);
  }

  useEffect(() => {
    async function setCategoryInfo() {
      console.log("in getCategoryInfo");
      let datafr = await API.graphql(
        graphqlOperation(getCategory, {
          category_id: selectedTopic.category_id,
          language: "fr",
        })
      );
      setNewTitleFr(datafr.data.getCategory.title);
      setNewDescriptionFr(datafr.data.getCategory.description);

      let dataen = await API.graphql(
        graphqlOperation(getCategory, {
          category_id: selectedTopic.category_id,
          language: "en",
        })
      );
      setNewTitleEn(dataen.data.getCategory.title);
      setNewDescriptionEn(dataen.data.getCategory.description);
      console.log("newDescriptionEn", newDescriptionEn);
      console.log("dataen", dataen);
    }
    setCategoryInfo();
  }, []);

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
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {I18n.get("editCategory")}
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
          <TextField
            InputLabelProps={{ shrink: true }}
            size="small"
            type="text"
            label={I18n.get("titleEn")}
            onChange={(e) => setNewTitleEn(e.target.value)}
            value={newTitleEn}
          />
          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label={I18n.get("descriptionEn")}
            multiline
            rows={5}
            onChange={(e) => setNewDescriptionEn(e.target.value)}
            value={newDescriptionEn}
          />
          <TextField
            InputLabelProps={{ shrink: true }}
            size="small"
            type="text"
            label={I18n.get("titleFr")}
            onChange={(e) => setNewTitleFr(e.target.value)}
            value={newTitleFr}
          />
          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label={I18n.get("descriptionFr")}
            multiline
            rows={5}
            onChange={(e) => setNewDescriptionFr(e.target.value)}
            value={newDescriptionFr}
          />
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
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          {I18n.get("cancel")}
        </Button>
        <Button autoFocus onClick={handleSave}>
          {I18n.get("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTopicDialog;
