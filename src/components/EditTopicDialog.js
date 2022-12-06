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
import CloseIcon from '@mui/icons-material/Close';
import { API, graphqlOperation } from 'aws-amplify'
import { updateCategory } from '../graphql/mutations';

const EditTopicDialog = ({
  open,
  handleClose,
  selectedTopic,
  setSelectedTopic
  }) => {
  const [newTitle, setNewTitle] = useState(selectedTopic.title)
  const [newDescription, setNewDescription] = useState(selectedTopic.description)

  const handleSave = async () => {
    let updatedCategory = {
      category_id: selectedTopic.category_id,
      acronym: selectedTopic.acronym,
      title: newTitle,
      description: newDescription
    }
    await API.graphql(graphqlOperation(updateCategory, updatedCategory))
      .then(() => {setSelectedTopic(updatedCategory); handleClose()})
      .catch(e => console.log(e))
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
        Edit Topic
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
          <CloseIcon />
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