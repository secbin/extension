import React, { useEffect, useContext } from "react";
import { AppContext } from "../contexts/AppContext";

import { Divider, Theme } from '@mui/material';

import {Action, Storage} from '../constants'
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { encrypt, decrypt } from "../chrome/utils/crypto";
import { useHistory } from "react-router-dom";
import { addLocalItem } from "../chrome/utils/storage";
import { postPastebin, getPastebin } from "../chrome/utils/pastebin";
import TextCounter from "../components/editor/TextCounter";
import EncryptFormDialog from "../components/dialog/EncDialog";
import DecryptFormDialog from "../components/dialog/DecDialog";
import DropDown from "../components/editor/DropDown";
import TextEditor from "../components/editor/TextEditor";
import SmartButton from "../components/editor/SmartButton";

const useStyles = makeStyles((theme: Theme) => ({
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

export default function Editor() {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { draft: {
    buttonEnabled,
    action: menu,
    key: passkey,
    plaintext: text
  },
    app: {
      dialog_id,
    }} = state;

  let { push } = useHistory();

  useEffect(() => {
    if(passkey && dialog_id) {
      dispatch({ type: Action.CLOSE_DIALOG })
      performAction()
    }
  }, [passkey, dialog_id]);

  const performAction = async () => {
    const currentMenu = menu;

    if (currentMenu === Action.ENCRYPT_PASTEBIN) {
      let res = await encrypt(text, passkey)
      let newNewlink = await postPastebin(res.data)
      const history = {
        action: Action.ENCRYPT_PASTEBIN,
        id: Math.floor(Math.random()),
        pastebinlink: newNewlink,
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date(),
      }

      dispatch({type: Action.ADD_TO_HISTORY, payload: history })
      addLocalItem(Storage.HISTORY, history);
      dispatch({type: Action.RESET_DRAFT, payload: null});

      push('/result')

    } else if (currentMenu === Action.ENCRYPT) {
      let res = await encrypt(text, passkey)
      const history = {
        action: Action.ENCRYPT,
        pastebinlink: "",
        id: Math.floor(Math.random()),
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date(),
      }

      dispatch({type: Action.ADD_TO_HISTORY, payload: history})
      addLocalItem(Storage.HISTORY, history)
      dispatch({type: Action.RESET_DRAFT, payload: null});
      push('/result')



    } else if (currentMenu === Action.DECRYPT_PASTEBIN) {
      if (passkey !== "") {
        let pasteText = await getPastebin(text)
        if (pasteText) {
          let res = decrypt(pasteText, passkey)
          dispatch({
            type: Action.UPDATE_PLAINTEXT,
            payload: { plaintext: res, action: currentMenu, buttonEnabled: buttonEnabled }
          });
        }
      }
    } else if (currentMenu === Action.DECRYPT) {
      console.log("PASSKEY IS", passkey)
      if (passkey !== "") {
        let res = decrypt(text, passkey)
        dispatch({
          type: Action.UPDATE_PLAINTEXT,
          payload: { plaintext: res, action: currentMenu, buttonEnabled: buttonEnabled }
        });
      }
    }
  }

  // @ts-ignore
  return (
    <>
      <div>
        <TextEditor />
        <Divider />
        <Box className={classes.bottomSection}>
          <TextCounter textLength={state.draft.plaintext.length} menu={menu} />
          <SmartButton open={open} setAnchorEl={setAnchorEl} />
          <DropDown anchorEl={anchorEl} setAnchorEl={setAnchorEl} open={open}/>
          <DecryptFormDialog />
          <EncryptFormDialog />
        </Box>
      </div>
    </>
  );
}
