import React, { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../contexts/AppContext";
import { styled, alpha } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import KeyIcon from '@mui/icons-material/Key';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputBase from '@mui/material/InputBase';
import { MAX_PASTEBIN_TEXT_LENGTH, MAX_ENC_TEXT_LENGTH, Action, Storage, PASTEBIN_BASEURL } from '../constants'
import ErrorIcon from '@mui/icons-material/Error';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { encrypt, decrypt } from "../chrome/utils/crypto";
import { useHistory } from "react-router-dom";
import { addLocalItem, getSyncItem, getSyncItemAsync } from "../chrome/utils/storage";
import { postPastebin, getPastebin } from "../chrome/utils/pastebin";
import { debounce } from 'lodash';

let buttonText = "";
let decKey = ""
let password = ""

const useStyles = makeStyles((theme: Theme) => ({
  counterContainer: {
    margin: '15px',
    display: 'inline-flex',
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
      tranresform: 'scale(1.035)'
    },
    transition: '0.15s'
  },
  large: {
    fontSize: '36px',
  },
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

export default function Editor() {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const buttonEnabled = state.draft.buttonEnabled;
  const menu = state.draft.action;
  const text = state.draft.plaintext;
  const [textBox, setTextBox] = React.useState(text);
  const [timerId, setTimerId] = useState(null);
  const [apiKey, setApiKey] = React.useState("")

  const [openDecForm, setOpenDecForm] = React.useState(false);
  const [openEncForm, setOpenEncForm] = React.useState(false);
  let { push, goBack } = useHistory();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    getSyncItem(Storage.API_KEY, (data) => {
      setApiKey(data[Storage.API_KEY]);
    })
  })

  const handleClose = (text: Action.ENCRYPT | Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN) => {
    setAnchorEl(null);
    dispatch({ type: Action.UPDATE_ENC_MENU, payload: { action: text, buttonEnabled: buttonEnabled } })
  };

  const actionWrapper = async (e: any) => {
    buttonText = e.target.innerText || "";
    //console.log("ACTION", e.target.innerText, buttonText);
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
      //console.log("ENC text", res)
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

      dispatch({type: Action.ADD_TO_HISTORY, payload: {
          id: Math.floor(Math.random()),
          pastebinlink: newNewlink,
          enc_mode: res.mode,
          key_length: res.key_len,
          key: res.key,
          enc_text: res.data,
          date: new Date(),
        }
      })
      addLocalItem(Storage.HISTORY, history);

      console.log("STATE", state)

      push('/result')

    } else if (buttonText === Action.ENCRYPT) {
      let res = await encrypt(text, password)
      //console.log("ENC text", res)
      const history = {
        action: Action.ENCRYPT,
        id: Math.floor(Math.random()),
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      }

      dispatch({type: Action.ADD_TO_HISTORY, payload: {
          id: Math.floor(Math.random()),
          pastebinlink: "",
          enc_mode: res.mode,
          key_length: res.key_len,
          key: res.key,
          enc_text: res.data,
          date: new Date(),
        }
      })
      addLocalItem(Storage.HISTORY, history)

      // @ts-ignore
      // dispatch({
      //   type: Action.ENCRYPT,
      //   payload: {
      //     action: Action.ENCRYPT,
      //     plaintext: textBox,
      //     enc_text: res.data,
      //     key: res.key,
      //   },
      // })
      console.log("STATE", state)

      push('/result')

    } else if (buttonText === Action.DECRYPT_PASTEBIN) {
      if (decKey !== "") {
        let pasteText = await getPastebin(text)
        if (pasteText) {
          let res = decrypt(pasteText, decKey)
          //console.log("SETTING NEW PLAINTEXT TO:", res);
          setTextBox(res);
          dispatch({
            type: Action.UPDATE_PLAINTEXT,
            payload: { plaintext: res, action: buttonText, buttonEnabled: buttonEnabled }
          });
        }
      }
    } else if (buttonText === Action.DECRYPT) {
      if (decKey !== "") {
        //console.log("Key:", decKey);
        let res = decrypt(text, decKey)
        //console.log("SETTING NEW PLAINTEXT TO:", res);
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
    let length = textbox.length;
    let buttonEnabled = false;
    let buttonText: Action.ENCRYPT | Action.DECRYPT | Action.ENCRYPT_PASTEBIN | Action.DECRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN = Action.ENCRYPT;
    setTextBox(textbox);

    if(timerId !== null) {
      // @ts-ignore

      clearTimeout(timerId);
    }

    // Set a new timer
    const newTimerId = setTimeout(() => {
      if (length <= MAX_ENC_TEXT_LENGTH && textbox.includes(PASTEBIN_BASEURL)) {
        buttonText = Action.DECRYPT_PASTEBIN
        buttonEnabled = true
      } else if (length <= MAX_ENC_TEXT_LENGTH && textbox.includes("C_TXT")) {
        buttonText = Action.DECRYPT
        buttonEnabled = true;
      } else if (length > 0 && length <= MAX_ENC_TEXT_LENGTH) {
        buttonEnabled = true
      } else {
        buttonEnabled = false;
      }
      dispatch({ type: Action.UPDATE_PLAINTEXT, payload: { plaintext: textbox, action: buttonText, buttonEnabled: buttonEnabled } })

    }, 250);

    // @ts-ignore
    setTimerId(newTimerId);
  };

  // const debouncedChangeHandler = (plaintext, action, buttonEnabled) => useCallback(
  //     debounce(updateDraft(plaintext, action, buttonEnabled), 300)
  //     , []);

  function DecryptFormDialog() {
    const [key, setKey] = React.useState("");
    const handleClose = () => {
      setOpenDecForm(false);
      decKey = key;
      //console.log("Setting the decKey:", decKey);
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

  function EncryptFormDialog() {
    const [key, setKey] = React.useState("");
    const handleClose = () => {
      setOpenEncForm(false);
      password = key;
      //console.log("Setting the password:", password);
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


  const fontSize = (length: number) => {
    if(length < 385) return '24px'
    else return '16px'
  }

  // @ts-ignore
  return (
    <>
      <div>
        <Box sx={{height: '470px', overflow: 'hidden'}}>
        <InputBase
          sx={{'& .MuiInputBase-inputMultiline': {
            padding: '5px 10px', overflowX: 'hidden'
          }, width: '100vw', overflow: 'hidden', fontSize: fontSize(textBox.length), textAlign: 'left', padding: '0px'}}
          multiline
          autoFocus
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            )}
          rows={clsx(textBox.length < 385 ? 13 : 20)}
          onChange={checkTypeOfText}
          value={textBox}
          placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
          inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px', 'padding': '6px' }}
        />
        </Box>

        <Divider />
        <Box className={classes.bottomSection}>
          <TextCounter textLength={textBox.length} menu={menu} />
          <Card
            className={classes.hoverStyle}
            style={{ minWidth: 100, textAlign: 'center', backgroundColor: '#1D6BC6', color:'#fff', margin: 15, borderRadius: 50, marginLeft: 'auto' }}>
            <ListItemButton sx={{ ml: 1, flex: 1, height: 40, textAlign: 'center', fontWeight: 800 }}
              onClick={actionWrapper}
              aria-controls={open ? 'Select type of action' : undefined}
              aria-haspopup="true"
              disabled={!buttonEnabled}
              aria-expanded={open ? 'true' : undefined}
            >
              <ListItemText>{menu}</ListItemText>
              <IconButton sx={{ p: '10px', opacity: 0.85 }} color='inherit' onClick={handleClick} disableRipple
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
            <MenuItem onClick={e => handleClose(Action.ENCRYPT)} dense disableRipple>
              <KeyIcon />
              {Action.ENCRYPT}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.ENCRYPT_PASTEBIN)} dense disableRipple>
              <KeyIcon />
              {Action.ENCRYPT_PASTEBIN}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.UNENCRYPT_PASTEBIN)} dense disableRipple>
              <KeyOffIcon />
              {Action.UNENCRYPT_PASTEBIN}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={e => handleClose(Action.DECRYPT)} dense disableRipple>
              <LockOpenIcon />
              {Action.DECRYPT}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon />
              {Action.DECRYPT_PASTEBIN}
            </MenuItem>
          </StyledMenu>
          <DecryptFormDialog />
          <EncryptFormDialog />
        </Box>
      </div>
    </>
  );
}
