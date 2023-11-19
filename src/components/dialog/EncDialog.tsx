import React, {useContext} from "react";
import {
  Button,
  Card,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  InputBase,
  Typography
} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext} from "../../contexts/AppContext";
import {Action} from "../../constants";

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
}));

export type LCopyboxType = {
  title?: string,
  value?: string,

}

const EncryptFormDialog = ({ title, value }: LCopyboxType) => {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const {
    app: {
      dialog_id,
    }} = state;

  const [key, setKey] = React.useState("");
  const handleClose = () => {
    console.log("SETTING KEY", {key})
    dispatch({ type: Action.SET_KEY, payload: { key } });
  };

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG })
  };

  return (
      <div>
        <Dialog open={dialog_id === 'enc_form'} onClose={handleClose} >
          <DialogTitle>
            <Typography variant={'h3'}>Set Passkey</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
              <Typography variant={'body2'}>
                Set the paskey to unlock this Pastebin. Random passkey is used by default if none is provided.
              </Typography>
            </DialogContentText>
            <Card className={classes.copybox}>
              <InputBase
                  autoFocus
                  placeholder={'Random passkey used by default'}
                  fullWidth
                  onChange={(event) => { setKey(event.target.value) }}
              />
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleClose}>Enter</Button>
          </DialogActions>
        </Dialog>
      </div>
  );
}

export default EncryptFormDialog;
