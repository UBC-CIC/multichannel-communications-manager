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
import CloseIcon from '@mui/icons-material/Close';
import { API, graphqlOperation } from 'aws-amplify'
import { createCategory, createTopic, addTopicToCategory } from '../graphql/mutations';
import { getAllTopics } from '../graphql/queries';

const AddTopicDialog = ({
  open,
  handleClose
  }) => {
  const [inputFields, setInputFields] = useState([])
  const [allTopics, setAllTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [description, setDescription] = useState('')
  const [topicExistsError, setTopicsExistError] = useState(false)

  useEffect(() => {
    async function getTopics() {
      const topicsQuery = await API.graphql(graphqlOperation(getAllTopics))
      const topics = topicsQuery.data.getAllTopics
      const topicsAcronym = topics.map(a => a.acronym)
      setAllTopics(topicsAcronym)
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
    if (allTopics.includes(event.target.value)) {
      setTopicsExistError(true)
    } else {
      setTopicsExistError(false)
      const values = [...inputFields]
      values[index][event.target.name] = event.target.value
      setInputFields(values)
    }
  }

  const handleSave = async () => {
    let createdTopic = {
      acronym: acronym,
      title: title,
      description: description
    }
    try {
      await API.graphql(graphqlOperation(createCategory, createdTopic))
        .then(async () => {
          for (let i = 0; i < inputFields.length; i++) {
            await API.graphql(graphqlOperation(createTopic, inputFields[i]))
          }
          let newSubtopics = inputFields.map(a => a.acronym)
          let allSubtopics = newSubtopics.concat(selectedTopics)
          for (let i = 0; i < allSubtopics.length; i++) {
            await API.graphql(graphqlOperation(addTopicToCategory, {
              category_acronym: createdTopic.acronym,
              topic_acronym: allSubtopics[i]
            }))
          }
          handleClose()
        })
    } catch (e) {
      console.log(e)
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
      <DialogTitle id="customized-dialog-title" onClose={clearFields}>
        Create A New Topic
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{display: 'flex', flexDirection: 'column', marginTop: 1, gap: 3}}>
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 3}}>
            <Box width={'40%'}>
              <TextField
                InputLabelProps={{ shrink: true }}
                size="small"
                type="text"
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>
            <Box width={'20%'}>
              <TextField
                InputLabelProps={{ shrink: true }}
                size="small"
                type="text"
                label="Acronym"
                onChange={(e) => setAcronym(e.target.value)}
              />
            </Box>
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
            <InputLabel>Select an existing subtopic</InputLabel>
            <Select
              multiple
              value={selectedTopics}
              onChange={handleSelectedTopics}
              input={<OutlinedInput label="Select an existing subtopic" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {allTopics.map((topic) => (
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
                helperText={(!!topicExistsError && "This subtopic already exists.")}
              />
            </div>
          ))}
          <Button sx={{width: 'fit-content'}} onClick={handleAddSubtopic}>
            Add New Subtopic...
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
        label="Subtopic Name"
        onChange={(event) => handleChange(event, index)}
        value={item.acronym}
        error={error}
        helperText={helperText}
      />
        <IconButton onClick={handleRemove}>
          <CloseIcon />
        </IconButton>
    </Box>
  )
}

export default AddTopicDialog