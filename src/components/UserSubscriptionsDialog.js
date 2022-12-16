import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip
} from "@mui/material";
import { Close } from '@mui/icons-material';

const UserSubscriptionDialog = ({
  open,
  handleClose,
  selectedSubtopics
  }) => {
  
  return (
    <Dialog
      PaperProps={{
        sx: {
          width: "50%",
          height: "50%"
        }
      }}
      open={open}
    >
      <DialogTitle id="customized-dialog-title">
        User Subscriptions
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
        {selectedSubtopics.map((subtopic, index) => (
          <Chip sx={{margin: 1}} key={index} label={`${subtopic.category_acronym}/${subtopic.topic_acronym}`} />
          ))}
      </DialogContent>
    </Dialog>
  );
}

export default UserSubscriptionDialog