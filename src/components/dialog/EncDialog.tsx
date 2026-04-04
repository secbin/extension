import React, { useContext, useEffect } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  InputBase,
  Typography,
} from '@mui/material';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { makeStyles } from '@mui/styles';
import { AppContext } from '../../contexts/AppContext';
import { Action } from '../../constants';
import forge from 'node-forge';

const useStyles = makeStyles(() => ({
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
    width: '100%',
    backgroundColor: 'rgba(0,117,250,0.08)',
  },
  buttonGr: {
    width: '100%',
    backgroundColor: 'rgba(149,149,149,0.08)',
    marginBottom: 8,
    color: 'grey',
  },
}));

const EncryptFormDialog = () => {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const {
    app: { dialog_id },
  } = state;

  const [key, setKey] = React.useState('');
  const [placeholder, setPlaceholder] = React.useState('');

  const handleClose = () => {
    const passkey = key || placeholder;
    dispatch({ type: Action.SET_KEY, payload: { key: passkey } });
  };

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  useEffect(() => {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]/=';
    let newPassword = '';
    for (let i = 0; i < 16; i++) {
      const randomByte = forge.random.getBytesSync(1);
      const randomIndex = randomByte.charCodeAt(0) % charset.length;
      newPassword += charset[randomIndex];
    }
    setKey(newPassword);
    setPlaceholder(newPassword);
  }, []);

  return (
    <div>
      <Dialog open={dialog_id === 'enc_form'} onClose={handleClose}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}
        >
          <KeyRoundedIcon />
          <Typography variant={'h3'}>Encrypt</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            <Typography variant={'body2'}>
              Set the passkey to unlock this Pastebin. A random passkey is
              pre-filled if none is provided.
            </Typography>
          </DialogContentText>
          <Card className={classes.copybox}>
            <InputBase
              autoFocus
              sx={{
                fontFamily: 'Menlo, monospace',
                fontSize: 16,
                letterSpacing: '-0.1px',
                fontWeight: 700,
              }}
              value={key}
              placeholder={placeholder}
              fullWidth
              onChange={event => {
                setKey(event.target.value);
              }}
            />
          </Card>
          <Button className={classes.buttonGr} onClick={handleCancel}>
            Cancel
          </Button>
          <Button className={classes.buttonEd} onClick={handleClose}>
            Encrypt
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EncryptFormDialog;
