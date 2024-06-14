import React, {useContext} from "react";
import {
  Card,
  IconButton, ListItemButton, ListItemText
} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext} from "../../contexts/AppContext";
import {Action} from "../../constants";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {useCreatePost} from "../../hooks/useCreatePost";

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
  textArea: {
    width: 350,
  },
  bottomSection: {
    display: 'flex',
  },
  animated: {
    transition: 'all 0.25s',
  },
  muted: {
    color: 'rgba(0,0,0,0.3)',
  }
}));

const SmartButton = ({setAnchorEl, open}: any) => {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const { draft: {
    buttonEnabled,
    action: menu },
      settings: {
    encryption
      }
} = state;

  const createPost = useCreatePost();

  const encryptionMap: any = {
    [Action.SEND_TO_PASTEBIN]: Action.ENCRYPT_PASTEBIN,
    [Action.OPEN_PASTEBIN]: Action.DECRYPT_PASTEBIN,
    [Action.SAVE_DRAFT]: Action.ENCRYPT
  }

  const plainMap: any = {
    [Action.ENCRYPT_PASTEBIN]: Action.SEND_TO_PASTEBIN,
    [Action.DECRYPT_PASTEBIN]: Action.OPEN_PASTEBIN,
    [Action.ENCRYPT]: Action.SAVE_DRAFT,
  }

  const getButtonText = () => {
    if (plainMap.hasOwnProperty(menu) && !encryption) {
      return plainMap[menu];
    } else if (encryptionMap.hasOwnProperty(menu) && encryption) {
      return encryptionMap[menu];
    }
    return menu;
  }


  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const actionWrapper = async (e: any) => {
    const buttonText = e.target.innerText || "";
    dispatch({ type: Action.SET_ACTION, payload: { action: buttonText || getButtonText() } })
    if (buttonText === Action.DECRYPT_PASTEBIN || buttonText === Action.DECRYPT) {
      dispatch({ type: Action.OPEN_DIALOG, payload: { dialog_id: 'dec_form' } })
    } else if (buttonText === Action.ENCRYPT_PASTEBIN || buttonText === Action.ENCRYPT) {
      dispatch({ type: Action.OPEN_DIALOG, payload: { dialog_id: 'enc_form' } })
    } else if (buttonText === Action.UNENCRYPT_PASTEBIN || buttonText === Action.SAVE_DRAFT || buttonText === Action.OPEN_PASTEBIN) {
      await createPost();
    }
  }

  return (
      <Card
          className={classes.animated}
          style={{ minWidth: 100, textAlign: 'center', backgroundColor: '#1D6BC6', color:'#fff', margin: 15, borderRadius: 50, marginLeft: 'auto' }}>
        <ListItemButton sx={{ ml: 1, flex: 1, height: 40, textAlign: 'center', fontWeight: 800, transition: 'all 0.10s' }}
                        onClick={actionWrapper}
                        aria-controls={open ? 'Select type of action' : undefined}
                        aria-haspopup="true"
                        disabled={!buttonEnabled}
                        aria-expanded={open ? 'true' : undefined}
        >
          <ListItemText className={classes.animated}>{getButtonText()}</ListItemText>
          <IconButton sx={{ p: '10px', opacity: 0.85 }} color='inherit' onClick={handleClick} disableRipple
                      aria-label="encryption/decryption options">

            <KeyboardArrowDownIcon />
          </IconButton>
        </ListItemButton>

      </Card>
  );
}

export default SmartButton;
