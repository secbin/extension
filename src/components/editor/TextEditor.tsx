import React, {useContext, useEffect, useState} from "react";
import {Box, InputBase,} from '@mui/material';
import {AppContext} from "../../contexts/AppContext";
import {Action, CIPHER_PREFIX, MAX_ENC_TEXT_LENGTH, PASTEBIN_BASEURL} from "../../constants";
import clsx from "clsx";

const TextEditor = () => {
  const { state, dispatch } = useContext(AppContext);
  const [textBox, setTextBox] = React.useState(state.draft.plaintext);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    setTextBox(state.draft.plaintext);
  }, [state.draft.plaintext]);


  const checkTypeOfText = (e: any) => {
    let textbox = e.target.value || "";
    let length = textbox.length;
    let buttonEnabled = false;
    const encryptionEnabled = state.settings.encryption;
    let buttonText: Action.ENCRYPT | Action.DECRYPT | Action.ENCRYPT_PASTEBIN | Action.DECRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.SEND_TO_PASTEBIN | Action.SAVE_DRAFT | Action.OPEN_PASTEBIN = encryptionEnabled ? Action.ENCRYPT_PASTEBIN : Action.SEND_TO_PASTEBIN;
    setTextBox(textbox);

    if(timerId !== null) {
      // @ts-ignore
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(() => {
      if (length <= MAX_ENC_TEXT_LENGTH && textbox.includes(PASTEBIN_BASEURL)) {
        buttonText = encryptionEnabled ? Action.DECRYPT_PASTEBIN : Action.OPEN_PASTEBIN
        buttonEnabled = true
      } else if (length <= MAX_ENC_TEXT_LENGTH && textbox.includes(CIPHER_PREFIX)) {
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

  const fontSize = (length: number) => {
    if(length < 385) return '24px'
    else return '16px'
  }

  return (
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
              defaultValue={state.draft.plaintext}
              value={textBox}
              placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
              inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px', 'padding': '6px' }}
          />
        </Box>
      </div>
  );
}

export default TextEditor;
