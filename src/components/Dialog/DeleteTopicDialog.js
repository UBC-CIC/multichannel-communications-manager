import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { API, graphqlOperation, I18n } from "aws-amplify";
import { deleteCategory, deleteTopic } from "../../graphql/mutations";
import { getAllTopics } from "../../graphql/queries";
import { useState, useEffect } from "react";
import ConfirmDeleteTopicDialog from "./ConfirmDeleteTopicDialog";

const DeleteTopicDialog = ({ open, handleClose, topics, reload }) => {
  const [value, setValue] = useState(0);
  const [checked, setChecked] = useState([]);
  const [checkedSubtopic, setCheckedSubtopic] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [type, setType] = useState("");
  const [openConfirmDeleteTopicDialog, setOpenConfirmDeleteTopicDialog] =
    useState(false);

  useEffect(() => {
    async function getTopics() {
      const topicsQuery = await API.graphql(graphqlOperation(getAllTopics));
      const topics = topicsQuery.data.getAllTopics;
      setAllTopics(topics);
    }
    getTopics();
  }, []);

  const closeDialog = () => {
    setChecked([]);
    setCheckedSubtopic([]);
    handleClose();
  };

  const handleChange = (e) => {
    const { id } = e.target;
    if (e.target.checked) {
      setChecked((prev) => [...prev, topics[id]]);
    } else {
      if (checked.some((item) => item.title === topics[id].title)) {
        setChecked((prev) => prev.filter((s) => s.title !== topics[id].title));
      }
    }
  };

  const handleChangeSubtopic = (e) => {
    const { id } = e.target;
    if (e.target.checked) {
      setCheckedSubtopic((prev) => [...prev, allTopics[id]]);
    } else {
      if (
        checkedSubtopic.some((item) => item.topic_id === allTopics[id].topic_id)
      ) {
        setCheckedSubtopic((prev) =>
          prev.filter((s) => s.topic_id !== allTopics[id].topic_id)
        );
      }
    }
  };

  const handleConfirmDelete = () => {
    if (value === 0) {
      setType("category");
    } else {
      setType("topic");
    }
    setOpenConfirmDeleteTopicDialog(true);
  };

  const handleDelete = async () => {
    if (value === 0) {
      for (let i = 0; i < checked.length; i++) {
        await API.graphql(
          graphqlOperation(deleteCategory, {
            category_id: checked[i].category_id,
          })
        ).catch((e) => console.log(e));
      }
    } else {
      for (let i = 0; i < checkedSubtopic.length; i++) {
        await API.graphql(
          graphqlOperation(deleteTopic, {
            topic_id: checkedSubtopic[i].topic_id,
          })
        ).catch((e) => console.log(e));
      }
    }
    setOpenConfirmDeleteTopicDialog(false);
    closeDialog();
    reload();
  };

  const handleUpdate = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Dialog
        PaperProps={{
          sx: {
            width: "fit-content",
            maxHeight: "75%",
          },
        }}
        open={open}
      >
        <DialogTitle id="customized-dialog-title">
          {I18n.get("delete")}
          <IconButton
            aria-label="close"
            onClick={closeDialog}
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
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs centered value={value} onChange={handleUpdate}>
              <Tab label="Categories" />
              <Tab label="Topics" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <List>
              {topics === null ? (
                <span>{I18n.get("nocurrentCategories")}</span>
              ) : (
                topics.map((value, index) => {
                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          id={index.toString()}
                          onChange={handleChange}
                        />
                      }
                    >
                      <ListItemText primary={value.title} />
                    </ListItem>
                  );
                })
              )}
            </List>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <List>
              {allTopics === null ? (
                <span>{I18n.get("nocurrentCategories")}</span>
              ) : (
                allTopics.map((value, index) => {
                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          id={index.toString()}
                          onChange={handleChangeSubtopic}
                        />
                      }
                    >
                      <ListItemText primary={value.acronym} />
                    </ListItem>
                  );
                })
              )}
            </List>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button autoFocus onClick={closeDialog}>
            {I18n.get("cancel")}
          </Button>
          <Button autoFocus onClick={handleConfirmDelete}>
            {I18n.get("delete")}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDeleteTopicDialog
        open={openConfirmDeleteTopicDialog}
        handleClose={() => setOpenConfirmDeleteTopicDialog(false)}
        handleDelete={handleDelete}
        type={type}
      />
    </>
  );
};

function TabPanel(props) {
  const { children, value, index } = props;

  return <div>{value === index && <Box>{children}</Box>}</div>;
}

export default DeleteTopicDialog;
