import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  IconButton,
  Box,
  TextField
} from "@mui/material";
import { Close, Upload } from '@mui/icons-material';
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { updateCategory } from '../../graphql/mutations';

const EditTopicDialog = ({
  open,
  handleClose,
  selectedTopic,
  setSelectedTopic
  }) => {
  const [newTitle, setNewTitle] = useState(selectedTopic.title)
  const [newDescription, setNewDescription] = useState(selectedTopic.description)
  const [uploadFile, setUploadFile] = useState();
  const [selectedUploadFile, setSelectedUploadFile] = useState('');

  const handleSave = async () => {
    let s3Key = ''
    if (document.getElementById("uploadFile").value === '') {
      s3Key = null
    } else {
      await Storage.put(uploadFile.name, uploadFile)
        .then(resp => s3Key = resp.key)
    }
    let updatedCategory = {
      category_id: selectedTopic.category_id,
      acronym: selectedTopic.acronym,
      title: newTitle,
      description: newDescription,
      picture_location: s3Key
    }
    await API.graphql(graphqlOperation(updateCategory, updatedCategory))
      .then(() => {setSelectedTopic(updatedCategory); handleClose()})
      .catch(e => console.log(e))
  }

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
          maxHeight: "80%"
        }
      }}
      open={open}
    >
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        Edit Category
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: 1, gap: 3}}>
          <TextField
            InputLabelProps={{ shrink: true }}
            size="small"
            type="text"
            label="Title"
            onChange={(e) => setNewTitle(e.target.value)}
            value={newTitle}
          />
          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label="Description"
            multiline
            rows={5}
            onChange={(e) => setNewDescription(e.target.value)}
            value={newDescription}
          />
          <Button
            size='small'
            component="label"
            variant="outlined"
            startIcon={<Upload />}
          >
            { selectedUploadFile ? selectedUploadFile : 'Upload Image' }
            <input type="file" id="uploadFile" accept="image/png, image/jpeg" hidden onChange={handleUploadFileChange}/>
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Cancel
        </Button>
        <Button autoFocus onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTopicDialog