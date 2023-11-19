import React, {useContext} from "react";
import {
  Button,
  Card,
  Dialog, DialogActions,
  DialogContent, DialogContentText,
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
  }
}));



const DecryptFormDialog = () => {
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
        <Dialog open={dialog_id === 'dec_form'} onClose={handleClose} >
          <DialogTitle>
            <Typography variant={'h3'}>Enter your Decryption Key:</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
              <Typography variant={'body2'}>
                This text is encrypted. Provide your passkey to decrypt its contents
              </Typography>
            </DialogContentText>
            <Card className={classes.copybox}>
              <InputBase
                  autoFocus
                  placeholder={"Decryption Key"}
                  fullWidth
                  sx={{ bgcolor: 'background.default' }}
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

export default DecryptFormDialog;
