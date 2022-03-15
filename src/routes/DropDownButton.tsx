import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../AppContext";
import { styled, alpha } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputBase from '@mui/material/InputBase';
import { MAX_PASTEBIN_TEXT_LENGTH, MAX_ENC_TEXT_LENGTH, Action, Storage } from '../constants'
import ErrorIcon from '@mui/icons-material/Error';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@mui/styles';
import { encrypt, decrypt } from "../chrome/utils/crypto";
import { useHistory } from "react-router-dom";
import { addLocalItem, getSyncItemAsync } from "../chrome/utils/storage";
import { postPastebin, getPastebin } from "../chrome/utils/pastebin";

let buttonText = "";
let decKey = ""
let password = ""

const useStyles = makeStyles(theme => ({
  counterContainer: {
    margin: 15,
    marginTop: 10
  },
  counter: {
    fontSize: 11,
  },
  red: {
    color: 'red',
    fontWeight: 600
  },
  grey: {
    color: 'grey'
  },
  bottomSection: {
    display: 'flex',
  },
  hoverStyle: {
    '&:hover': {
      transition: '0.15s',
      transform: 'scale(1.02)'
    },
    '&:active': {
      transition: '0.08s',
      opacity: 0.9,
      transform: 'scale(1.035)'
    },
    transition: '0.15s'
  },
  large: {
    fontSize: '36px',
  }, copybox: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 6,
    border: '1px solid #E0E0E0',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginTop: 20,
    marginBottom: 14,
  },
}));


const StyledMenu = styled((props) => (
  <Menu
    open={false} elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props} />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '8px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export function TextCounter(props: any) {
  let MAX = MAX_ENC_TEXT_LENGTH;
  if (props.menu === Action.ENCRYPT_PASTEBIN) { // button is pastebine enc
    MAX = MAX_PASTEBIN_TEXT_LENGTH;
  }
  const classes = useStyles();
  let safe = props.textLength < MAX

  return (
    <div className={classes.counterContainer}>
      {!safe && <ErrorIcon className={clsx(classes.red, classes.counter)} sx={{ mr: 0.5, mb: -0.25 }} />}
      <Typography className={clsx(safe ? classes.grey : classes.red, classes.counter)} variant={'body1'} >{props.textLength}/{MAX}</Typography>
    </div>
  );
}

export default function CustomizedMenus() {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const buttonEnabled = state.draft.buttonEnabled;
  const menu = state.draft.action;
  const text = state.draft.plaintext;
  const [textBox, setTextBox] = React.useState(text);

  const [openDecForm, setOpenDecForm] = React.useState(false);
  const [openEncForm, setOpenEncForm] = React.useState(false);
  //console.log("STATE", state);
  let { push, goBack } = useHistory();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (text: Action.ENCRYPT | Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT_PASTEBIN) => {
    setAnchorEl(null);
    dispatch({ type: Action.UPDATE_ENC_MENU, payload: { action: text, buttonEnabled: buttonEnabled } })
  };

  const actionWrapper = async (e: any) => {
    buttonText = e.target.innerText || "";
    console.log("ACTION", e.target.innerText, buttonText);
    if (buttonText === Action.DECRYPT_PASTEBIN || buttonText === Action.DECRYPT) {
      setOpenDecForm(true);
    } else if (buttonText === Action.ENCRYPT_PASTEBIN || buttonText === Action.ENCRYPT) {
      setOpenEncForm(true);
    }
  }

  const performAction = async () => {
    //let buttonText = e.target.innerText || "";
    if (buttonText === Action.ENCRYPT_PASTEBIN) {
      let res = await encrypt(text, password)
      console.log("ENC text", res)
      let newNewlink = await postPastebin(res.data)
      const history = {
        action: Action.ENCRYPT_PASTEBIN,
        id: Math.floor(Math.random()),
        pastebinlink: newNewlink,
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      }
      addLocalItem(Storage.HISTORY, history)

      dispatch({
        type: Action.ENCRYPT_PASTEBIN,
        payload: {
          action: Action.ENCRYPT_PASTEBIN,
          plaintext: textBox,
          ciphertext: res.data,
          key: res.key,
          pastebinlink: newNewlink,
        },
      })
      console.log("STATE", state)
      push('/result')

    } else if (buttonText === Action.ENCRYPT) {
      let res = await encrypt(text, password)
      console.log("ENC text", res)
      const history = {
        action: Action.ENCRYPT,
        id: Math.floor(Math.random()),
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      }
      addLocalItem(Storage.HISTORY, history)

      // @ts-ignore
      dispatch({
        type: Action.ENCRYPT,
        payload: {
          action: Action.ENCRYPT,
          plaintext: textBox,
          ciphertext: res.data,
          key: res.key,
        },
      })
      console.log("STATE", state)
      push('/result')

    } else if (buttonText === Action.DECRYPT_PASTEBIN) {
      if (decKey !== "") {
        let pasteText = await getPastebin(text)
        if (pasteText) {
          let res = decrypt(pasteText, decKey)
          console.log("SETTING NEW PLAINTEXT TO:", res);
          setTextBox(res);
          dispatch({
            type: Action.UPDATE_PLAINTEXT,
            payload: { plaintext: res, action: buttonText, buttonEnabled: buttonEnabled }
          });
        }
      }
    } else if (buttonText === Action.DECRYPT) {
      if (decKey !== "") {
        console.log("Key:", decKey);
        let res = decrypt(text, decKey)
        console.log("SETTING NEW PLAINTEXT TO:", res);
        setTextBox(res);
        dispatch({
          type: Action.UPDATE_PLAINTEXT,
          payload: { plaintext: res, action: buttonText, buttonEnabled: buttonEnabled }
        });
      }
    }
  }

  const checkTypeOfText = (e: any) => {
    let textbox = e.target.value || "";
    let buttonEnabled = false;
    let buttonText = Action.ENCRYPT;
    if (textbox.includes("pastebin.com") && e.target.value.length <= MAX_ENC_TEXT_LENGTH) {
      // console.log("PASTE BIN LINK FOUND")
      buttonText = Action.DECRYPT_PASTEBIN
      buttonEnabled = true
    } else if (textbox.includes("C_TXT") && e.target.value.length <= MAX_ENC_TEXT_LENGTH) {
      // console.log("ENCRYPTED TEXT FOUND")
      buttonText = Action.DECRYPT
      buttonEnabled = true
    } else if (textbox && e.target.value.length <= MAX_PASTEBIN_TEXT_LENGTH) {
      // console.log("PLAINTEXT FOUND")
      buttonText = Action.ENCRYPT_PASTEBIN
      buttonEnabled = true
    } else if (buttonText === Action.ENCRYPT && e.target.value.length <= MAX_ENC_TEXT_LENGTH) {
      buttonEnabled = true
    } else {
      buttonEnabled = false
    }
    // setMenu(buttonText)
    // setButtonEnabled(buttonEnabled)
    setTextBox(textbox);
    dispatch({ type: Action.UPDATE_PLAINTEXT, payload: { plaintext: textbox, action: buttonText, buttonEnabled: buttonEnabled } });
  };

  function DecryptFormDialog() {
    const [key, setKey] = React.useState("");
    const handleClose = () => {
      setOpenDecForm(false);
      decKey = key;
      console.log("Setting the decKey:", decKey);
      performAction();
    };

    const handleCancel = () => {
      setOpenDecForm(false);
    };

    return (
      <div>
        <Dialog open={openDecForm} onClose={handleClose} >
          <DialogTitle>
            <Typography variant={'h3'}>Enter your Decryption Key:</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Card className={classes.copybox}>
              <InputBase
                autoFocus
                placeholder={"Dec Key"}
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

  function EncryptFormDialog() {
    const [key, setKey] = React.useState("");
    const handleClose = () => {
      setOpenEncForm(false);
      password = key;
      console.log("Setting the password:", password);
      performAction();
    };

    const handleRandom = () => {
      performAction();
    };

    const handleCancel = () => {
      setOpenEncForm(false);
    };

    return (
      <div>
        <Dialog open={openEncForm} onClose={handleClose} >
          <DialogTitle>
            <Typography variant={'h3'}>Enter a Password:</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
              <Typography variant={'body2'}>
                Enter a password or select random to generate a random key.
              </Typography>
            </DialogContentText>
            <Card className={classes.copybox}>
              <InputBase
                autoFocus
                placeholder={"Password"}
                fullWidth
                onChange={(event) => { setKey(event.target.value) }}
              />
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleRandom}>Random</Button>
            <Button onClick={handleClose}>Enter</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }



  // @ts-ignore
  return (
    <>
      <div>
        <InputBase
          className={clsx(text.length < 30 && '24')}
          sx={{ width: 440, height: 464, overflow: 'hidden', fontSize: clsx(text.length < 350 ? '24px' : '16px'), backgroundColor: 'white', textAlign: 'left', padding: 2 }}
          multiline
          autoFocus
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            )}
          rows={clsx(text.length < 350 ? 13 : 20)}
          onChange={checkTypeOfText}
          value={textBox}
          placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
          inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px' }}
        />

        <Divider />
        <div className={classes.bottomSection}>
          <TextCounter textLength={text.length} menu={menu} />
          <Card
            className={classes.hoverStyle}
            style={{ minWidth: 100, textAlign: 'center', backgroundColor: '#1D6BC6', color: 'white', margin: 15, borderRadius: 50, marginLeft: 'auto' }}>
            <ListItemButton sx={{ ml: 1, flex: 1, height: 40, textAlign: 'center', fontWeight: 800 }}
              onClick={actionWrapper}
              id="demo-customized-button"
              aria-controls={open ? 'demo-customized-menu' : undefined}
              aria-haspopup="true"
              disabled={!buttonEnabled}
              aria-expanded={open ? 'true' : undefined}
            // variant="contained"
            // disableElevation

            >
              <ListItemText>{menu}</ListItemText>
              <IconButton color="primary" sx={{ p: '10px', color: 'white' }} onClick={handleClick}
                aria-label="encryption/decryption options">
                <KeyboardArrowDownIcon />
              </IconButton>
            </ListItemButton>

          </Card>
          <StyledMenu
            /* @ts-ignore */
            anchorEl={anchorEl}
            open={open}
            onClose={(e: any) => handleClose(menu)}
          >
            <MenuItem sx={{ fontWeight: 700, color: 'grey' }} disabled dense disableRipple>
              Select Action
            </MenuItem>
            <Divider />
            <MenuItem onClick={e => handleClose(Action.ENCRYPT)} dense disableRipple>
              <LockIcon />
              {Action.ENCRYPT}
            </MenuItem>
            <MenuItem onClick={e => handleClose(Action.ENCRYPT_PASTEBIN)} dense disableRipple>
              <LockIcon />
              {Action.ENCRYPT_PASTEBIN}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon />
              {Action.DECRYPT}
            </MenuItem>
            <MenuItem onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon />
              {Action.DECRYPT_PASTEBIN}
            </MenuItem>
          </StyledMenu>
          <DecryptFormDialog />
          <EncryptFormDialog />
        </div>
      </div>
    </>
  );
}
