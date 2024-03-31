import React, {useContext} from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  InputBase,
  Typography
} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext} from "../../contexts/AppContext";
import {Action, Storage} from "../../constants";

const useStyles = makeStyles(theme => ({
  copybox: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginTop: 20,
    marginBottom: 14,
  },
  buttonEd: {
    width: "100%",
    backgroundColor: 'rgba(0,117,250,0.08)',
  },
  buttonWarning: {
    backgroundColor: 'rgb(250,0,0,0.08)',
    color: 'rgb(213,0,0)',
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    gap: "7px",
    marginTop: "20px",
  }
}));

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import clsx from "clsx";
import {setLocalItem} from "../../chrome/utils/storage";

export type LCopyboxType = {
  title?: string,
  value?: string,

}

const ResetWarningDialog = ({ title, value }: LCopyboxType) => {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const {
    app: {
      dialog_id,
    }, history} = state;

  const handleClose = () => {
    dispatch({ type: Action.CLOSE_DIALOG })
  };

  const resetSettings = (e: any) => {
    dispatch({type: Action.RESET_SETTINGS, payload: null});
    dispatch({ type: Action.CLOSE_DIALOG })
  }

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG })
  };

  return (
      <div>
        <Dialog open={dialog_id === "reset_settings"} onClose={handleClose} >
          <DialogTitle sx={{display: "flex", alignItems: "center", columnGap: "8px"}}>
            <WarningAmberRoundedIcon />
            <Typography variant={'h3'}>Confirm Action</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
              <Typography variant={'body2'}>
                All settings will be reset to default locally and on synced devices.
              </Typography>
            </DialogContentText>
            <div className={classes.buttonContainer}>
              <Button className={classes.buttonEd} onClick={handleCancel}>Cancel</Button>
              <Button className={clsx(classes.buttonEd, classes.buttonWarning)} onClick={resetSettings}>Reset Settings</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}

export default ResetWarningDialog;
