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
import { Action } from '../../constants';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

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

const ResetWarningDialog = () => {
  const { state, dispatch } = useContext(AppContext);
  const {
    app: { dialog_id },
  } = state;

  const handleClose = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  const resetSettings = () => {
    dispatch({ type: Action.RESET_SETTINGS, payload: null });
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  return (
    <div>
      <Dialog open={dialog_id === 'reset_settings'} onClose={handleClose}>
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
              All settings will be reset to default locally and on synced
              devices.
            </Typography>
          </DialogContentText>
          <div style={buttonContainerSx}>
            <Button sx={buttonEdSx} onClick={handleCancel}>
              Cancel
            </Button>
            <Button sx={buttonWarningSx} onClick={resetSettings}>
              Reset Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetWarningDialog;
