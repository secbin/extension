import React, { useContext } from 'react';
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
import { AppContext } from '../../contexts/AppContext';
import { Action } from '../../constants';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';

const inputCardSx = {
  paddingLeft: '10px',
  paddingRight: '10px',
  borderRadius: '6px',
  border: '1px solid rgba(170,170,170,0.25)',
  boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
  marginTop: '20px',
  marginBottom: '20px',
};

const DecryptFormDialog = () => {
  const { state, dispatch } = useContext(AppContext);
  const {
    app: { dialog_id },
  } = state;

  const [key, setKey] = React.useState('');

  const handleClose = () => {
    dispatch({ type: Action.SET_KEY, payload: { key } });
  };

  const handleCancel = () => {
    dispatch({ type: Action.CLOSE_DIALOG });
  };

  return (
    <div>
      <Dialog open={dialog_id === 'dec_form'} onClose={handleClose}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}
        >
          <KeyRoundedIcon />
          <Typography variant={'h3'}>Decrypt</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            <Typography variant={'body2'}>
              This text is encrypted. Provide your passkey to decrypt its
              contents
            </Typography>
          </DialogContentText>
          <Card sx={inputCardSx}>
            <InputBase
              autoFocus
              placeholder={'Decryption Key'}
              sx={{
                fontFamily: 'Menlo, monospace',
                fontSize: 16,
                letterSpacing: '-0.1px',
                fontWeight: 700,
              }}
              fullWidth
              onChange={event => {
                setKey(event.target.value);
              }}
            />
          </Card>
          <Button
            sx={{
              width: '100%',
              backgroundColor: 'rgba(149,149,149,0.08)',
              marginBottom: 1,
              color: 'grey',
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            sx={{ width: '100%', backgroundColor: 'rgba(0,117,250,0.08)' }}
            onClick={handleClose}
          >
            Decrypt
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DecryptFormDialog;
