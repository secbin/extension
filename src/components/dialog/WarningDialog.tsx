import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { AppContext } from '../../contexts/AppContext';
import { Action, Storage } from '../../constants';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { setLocalItem } from '../../chrome/utils/storage';

const buttonEdSx = { width: '100%', backgroundColor: 'rgba(0,117,250,0.08)' };
const buttonWarningSx = {
  width: '100%',
  backgroundColor: 'rgb(250,0,0,0.08)',
  color: 'rgb(213,0,0)',
};
const buttonContainerSx = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column' as const,
  gap: '7px',
  marginTop: '20px',
};

const WarningDialog = () => {
  const { state, dispatch } = useContext(AppContext);
  const {
    app: { dialog_id },
    history,
  } = state;

  const handleClose = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  const clearHistory = () => {
    setLocalItem(Storage.HISTORY, []);
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  return (
    <div>
      <Dialog open={dialog_id === 'reset_history'} onClose={handleClose}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}
        >
          <WarningAmberRoundedIcon />
          <Typography variant={'h3'}>Confirm Action</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            <Typography variant={'body2'}>
              You have <b>{history?.length || 0} items</b> in your history. All
              history will be deleted from local storage and synced devices.
            </Typography>
          </DialogContentText>
          <div style={buttonContainerSx}>
            <Button sx={buttonEdSx} onClick={handleCancel}>
              Cancel
            </Button>
            <Button sx={buttonWarningSx} onClick={clearHistory}>
              Clear History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarningDialog;
