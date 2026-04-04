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
import { makeStyles } from '@mui/styles';
import { AppContext } from '../../contexts/AppContext';
import { Action } from '../../constants';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  buttonEd: {
    width: '100%',
    backgroundColor: 'rgba(0,117,250,0.08)',
  },
  buttonWarning: {
    backgroundColor: 'rgb(250,0,0,0.08)',
    color: 'rgb(213,0,0)',
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '7px',
    marginTop: '20px',
  },
}));

const ResetWarningDialog = () => {
  const classes = useStyles();
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
          <div className={classes.buttonContainer}>
            <Button className={classes.buttonEd} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className={clsx(classes.buttonEd, classes.buttonWarning)}
              onClick={resetSettings}
            >
              Reset Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetWarningDialog;
