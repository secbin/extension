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
import { MAX_TEXT_LENGTH, Action, Storage } from '../constants'
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@mui/styles';
import { encrypt, decrypt } from "../chrome/utils/crypto";
import { useHistory } from "react-router-dom";
import { addItem } from "../chrome/utils/storage";
import { postPastebin, getPastebin } from "../chrome/utils/pastebin";

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
  const classes = useStyles();
  let safe = props.textLength < MAX_TEXT_LENGTH
  return (
    <div className={classes.counterContainer}>
      {!safe && <ErrorIcon className={clsx(classes.red, classes.counter)} sx={{ mr: 0.5, mb: -0.25 }} />}
      <Typography className={clsx(safe ? classes.grey : classes.red, classes.counter)} variant={'body1'} >{props.textLength}/{MAX_TEXT_LENGTH}</Typography>
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
  console.log("STATE", state);
  let { push, goBack } = useHistory();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);


  };
  const handleClose = (text: Action.ENCRYPT | Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT_PASTEBIN) => {
    setAnchorEl(null);
    // setMenu(text)
    dispatch({ type: Action.UPDATE_ENC_MENU, payload: { action: text, buttonEnabled: buttonEnabled } })
  };



  const performAction = async (e: any) => {
    let buttonText = e.target.innerText || "";
    if (buttonText === "Encrypt to Pastebin") {
      let res = await encrypt(text)
      console.log("ENC text", res)
      let newNewlink = await postPastebin(res.data)
      const history = {
        id: Math.floor(Math.random()),
        pastebinlink: newNewlink,
        key: res.key,
        enc_text: res.data,
        enc_mode: state.settings.enc_mode,
        key_length: state.settings.key_length,
        date: Date(),
      }
      addItem(Storage.HISTORY, history)

      dispatch({
        type: Action.ENCRYPT_PASTEBIN,
        payload: {
          action: Action.ENCRYPT_PASTEBIN,
          plaintext: text,
          ciphertext: res.data,
          key: res.key,
          pastebinlink: newNewlink,
        },
      })
      console.log("STATE", state)
      push('/result')

    } else if (buttonText === "Encrypt Plaintext") {
      let res = await encrypt(text)
      console.log("ENC text", res)
      const history = {
        id: Math.floor(Math.random()),
        enc_text: res.data,
        key: res.key,
        enc_mode: state.settings.enc_mode,
        key_length: state.settings.key_length,
        date: Date(),
      }
      addItem(Storage.HISTORY, history)

      // @ts-ignore
      dispatch({
        type: Action.ENCRYPT,
        payload: {
          action: Action.ENCRYPT,
          plaintext: text,
          ciphertext: res.data,
          key: res.key,
        },
      })
      console.log("STATE", state)
      push('/result')

    } else if (buttonText === "Decrypt Pastebin") {
      let pasteText = await getPastebin(text)
      console.log(pasteText);
      if (pasteText) {
        let key = prompt("Please enter your key") || ""; //TODO - Maybe add text box instead
        let res = decrypt(pasteText, key)
        console.log("SETTING NEW PLAINTEXT TO:", res);
      }
    } else if (buttonText === "Decrypt Ciphertext") {
      let key = prompt("Please enter your key");
      let res = decrypt(text, key ? key : "")
      console.log("SETTING NEW PLAINTEXT TO:", res);
    }
  }

  const checkTypeOfText = (e: any) => {
    let textbox = e.target.value || "";
    let buttonEnabled = false;
    let buttonText = Action.ENCRYPT;
    if (e.target.value.length > MAX_TEXT_LENGTH) {
      buttonEnabled = false
    }
    else if (textbox.includes("pastebin.com")) {
      // console.log("PASTE BIN LINK FOUND")
      buttonText = Action.DECRYPT_PASTEBIN
      buttonEnabled = true
    } else if (textbox.includes("C_TXT")) {
      // console.log("ENCRYPTED TEXT FOUND")
      buttonText = Action.DECRYPT
      buttonEnabled = true
    } else if (textbox) {
      // console.log("PLAINTEXT FOUND")
      buttonText = Action.ENCRYPT_PASTEBIN
      buttonEnabled = true
    } else {
      buttonEnabled = false
    }
    // setMenu(buttonText)
    // setButtonEnabled(buttonEnabled)
    dispatch({ type: Action.UPDATE_PLAINTEXT, payload: { plaintext: textbox, action: buttonText, buttonEnabled: buttonEnabled } });


  };



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
          defaultValue={text}
          placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
          inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px' }}
        />

        <Divider />
        <div className={classes.bottomSection}>
          <TextCounter textLength={text.length} />
          <Card
            className={classes.hoverStyle}
            style={{ minWidth: 100, textAlign: 'center', backgroundColor: '#1D6BC6', color: 'white', margin: 15, borderRadius: 50, marginLeft: 'auto' }}>
            <ListItemButton sx={{ ml: 1, flex: 1, height: 40, textAlign: 'center', fontWeight: 800 }}
              onClick={performAction}
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
              Encrypt Plaintext
            </MenuItem>
            <MenuItem onClick={e => handleClose(Action.ENCRYPT_PASTEBIN)} dense disableRipple>
              <LockIcon />
              Encrypt to Pastebin
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon />
              Decrypt Plaintext
            </MenuItem>
            <MenuItem onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon />
              Decrypt Pastebin
            </MenuItem>
          </StyledMenu>

        </div>
      </div>
    </>
  );
}
