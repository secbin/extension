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
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";

const useStyles = makeStyles(theme => ({
  copybox: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonEd: {
    width: "100%",
    backgroundColor: 'rgba(0,117,250,0.08)',
  },
  buttonGr: {
    width: "100%",
    backgroundColor: 'rgba(149,149,149,0.08)',
    marginBottom: 8,
    color: 'grey'
  },
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
          <DialogTitle sx={{display: "flex", alignItems: "center", columnGap: "8px"}}>
            <KeyRoundedIcon />
            <Typography variant={'h3'}>Decrypt</Typography>
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
                  sx={{fontFamily: 'Menlo, monospace', fontSize: 16, letterSpacing: '-0.1px', fontWeight: 700}}
                  fullWidth
                  onChange={(event) => { setKey(event.target.value) }}
              />
            </Card>
            <Button className={classes.buttonGr} onClick={handleCancel}>Cancel</Button>
            <Button className={classes.buttonEd} onClick={handleClose}>Decrypt</Button>
          </DialogContent>
          {/*<DialogActions>*/}
          {/*  <Button onClick={handleCancel}>Cancel</Button>*/}
          {/*  <Button onClick={handleClose}>Enter</Button>*/}
          {/*</DialogActions>*/}
        </Dialog>
      </div>
  );
}

export default DecryptFormDialog;
