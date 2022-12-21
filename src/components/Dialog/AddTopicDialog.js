import { useEffect, useState } from 'react';
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
  FormControl
} from "@mui/material";
import { Upload, Close } from '@mui/icons-material';
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { createCategory, createTopic, addTopicToCategory } from '../../graphql/mutations';
import { getAllTopics } from '../../graphql/queries';

const AddTopicDialog = ({
  open,
  handleClose,
  reload
  }) => {
  const [inputFields, setInputFields] = useState([])
  const [allTopics, setAllTopics] = useState([])
  const [newTopic, setNewTopic] = useState('')
  const [selectedTopics, setSelectedTopics] = useState([])
  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [description, setDescription] = useState('')
  const [topicExistsError, setTopicsExistError] = useState(false)
  const [uploadFile, setUploadFile] = useState();
  const [selectedUploadFile, setSelectedUploadFile] = useState('');

  useEffect(() => {
    async function getTopics() {
      const topicsQuery = await API.graphql(graphqlOperation(getAllTopics))
      const topics = topicsQuery.data.getAllTopics
      if (topics !== null) {
        const topicsAcronym = topics.map(a => a.acronym)
        setAllTopics(topicsAcronym)
      }
    }
    getTopics()
  }, [])
  

  const clearFields = () => {
    setInputFields([])
    setSelectedTopics([])
    setTitle('')
    setAcronym('')
    setDescription('')
    setTopicsExistError(false)
    handleClose()
    setUploadFile()
    setSelectedUploadFile('')
  }

  const handleAddSubtopic = () => {
    setInputFields([...inputFields, {acronym: ""}])
  }

  const handleRemoveSubtopic = (index) => {
    if (inputFields.length !== 0) {
      const values = [...inputFields]
      values.splice(index, 1)
      setInputFields(values)
    }
    setTopicsExistError(false)
  }

  const handleChange = (event, index) => {
    setNewTopic(event.target.value)
    setTopicsExistError(false)
    const values = [...inputFields]
    values[index][event.target.name] = event.target.value
    setInputFields(values)
  }

  const handleSave = async () => {
    if (allTopics.includes(newTopic)) {
      setTopicsExistError(true)
    } else {
      setTopicsExistError(false)
      let s3Key = ''
      if (document.getElementById("uploadFile").value === '') {
        s3Key = null
      } else {
        await Storage.put(uploadFile.name, uploadFile)
          .then(resp => s3Key = resp.key)
          .catch(e => console.log(e))
      }
      let createdTopic = {
        acronym: acronym,
        title: title,
        description: description,
        picture_location: s3Key
      }
      try {
        // create the category in the database
        await API.graphql(graphqlOperation(createCategory, createdTopic))
          .then(async (res) => {
            // create all the new topics
            for (let i = 0; i < inputFields.length; i++) {
              await API.graphql(graphqlOperation(createTopic, inputFields[i]))
            }
            let newSubtopics = inputFields.map(a => a.acronym)
            let allSubtopics = newSubtopics.concat(selectedTopics)
            // add all the topics to the category
            for (let i = 0; i < allSubtopics.length; i++) {
              await API.graphql(graphqlOperation(addTopicToCategory, {
                category_acronym: createdTopic.acronym,
                topic_acronym: allSubtopics[i]
              }))
            }
            clearFields()
            reload()
          })
      } catch (e) {
        console.log(e)
      }
    }
  }

  const handleSelectedTopics = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedTopics(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
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
          maxHeight: "80%"
        }
      }}
      open={open}
    >
      <DialogTitle id="customized-dialog-title">
        Create A New Category
        <IconButton
          aria-label="close"
          onClick={clearFields}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: 1, gap: 3}}>
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 3}}>
            <Box width={'40%'}>
              <TextField
                InputLabelProps={{ shrink: true }}
                inputProps={{ maxLength: 49 }}
                size="small"
                type="text"
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>
            <Box width={'20%'}>
              <TextField
                InputLabelProps={{ shrink: true }}
                inputProps={{ maxLength: 29 }}
                size="small"
                type="text"
                label="Acronym"
                onChange={(e) => setAcronym(e.target.value)}
              />
            </Box>
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
          <TextField
            type="text"
            InputLabelProps={{ shrink: true }}
            label="Description"
            multiline
            rows={5}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl>
            <InputLabel>Select an existing topic</InputLabel>
            <Select
              multiple
              value={selectedTopics}
              onChange={handleSelectedTopics}
              input={<OutlinedInput label="Select an existing topic" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {allTopics === null ? <></> : allTopics.map((topic) => (
                <MenuItem
                  key={topic}
                  value={topic}
                >
                  {topic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {inputFields.map((item, index) => (
            <div key={index}>
              <InputRow
                inputFields={inputFields}
                index={index}
                item={item}
                handleChange={handleChange}
                handleRemove={handleRemoveSubtopic}
                error={topicExistsError}
                helperText={(!!topicExistsError && "This topic already exists.")}
              />
            </div>
          ))}
          <Button sx={{width: 'fit-content'}} onClick={handleAddSubtopic}>
            Add New topic...
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={clearFields}>
          Cancel
        </Button>
        <Button autoFocus onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// The textfield for all the new topics the user is adding
const InputRow = ({
  index,
  item,
  handleChange,
  handleRemove,
  error,
  helperText
}) => {
  return (
    <Box>
      <TextField
        size="small"
        name="acronym"
        InputLabelProps={{ shrink: true }}
        label="Topic Name"
        onChange={(event) => handleChange(event, index)}
        value={item.acronym}
        error={error}
        helperText={helperText}
      />
        <IconButton onClick={handleRemove}>
          <Close />
        </IconButton>
    </Box>
  )
}

export default AddTopicDialog