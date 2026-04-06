import React, { useContext, useEffect, useRef } from 'react';
import { Box, InputBase } from '@mui/material';
import { AppContext } from '../../contexts/AppContext';
import {
  Action,
  CIPHER_PREFIX,
  MAX_ENC_TEXT_LENGTH,
  PASTEBIN_BASEURL,
} from '../../constants';

const TextEditor = () => {
  const { state, dispatch } = useContext(AppContext);
  const [textBox, setTextBox] = React.useState(state.draft.plaintext);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextBox(state.draft.plaintext);
  }, [state.draft.plaintext]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const checkTypeOfText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const textbox = e.target.value || '';
    const length = textbox.length;
    let buttonEnabled = false;
    const encryptionEnabled = state.settings.encryption;
    let buttonText:
      | Action.ENCRYPT
      | Action.DECRYPT
      | Action.ENCRYPT_PASTEBIN
      | Action.DECRYPT_PASTEBIN
      | Action.UNENCRYPT_PASTEBIN
      | Action.SEND_TO_PASTEBIN
      | Action.SAVE_DRAFT
      | Action.OPEN_PASTEBIN = encryptionEnabled
      ? Action.ENCRYPT_PASTEBIN
      : Action.SEND_TO_PASTEBIN;
    setTextBox(textbox);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (length <= MAX_ENC_TEXT_LENGTH && textbox.includes(PASTEBIN_BASEURL)) {
        buttonText = encryptionEnabled
          ? Action.DECRYPT_PASTEBIN
          : Action.OPEN_PASTEBIN;
        buttonEnabled = true;
      } else if (
        length <= MAX_ENC_TEXT_LENGTH &&
        textbox.includes(CIPHER_PREFIX)
      ) {
        buttonText = Action.DECRYPT;
        buttonEnabled = true;
      } else if (length > 0 && length <= MAX_ENC_TEXT_LENGTH) {
        buttonEnabled = true;
      } else {
        buttonEnabled = false;
      }
      dispatch({
        type: Action.UPDATE_PLAINTEXT,
        payload: {
          plaintext: textbox,
          action: buttonText,
          buttonEnabled: buttonEnabled,
        },
      });
    }, 250);
  };

  const fontSize = (length: number) => {
    if (length < 385) return '24px';
    else return '16px';
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      <InputBase
        sx={{
          '& .MuiInputBase-inputMultiline': {
            padding: '5px 10px',
            overflowX: 'hidden',
          },
          width: '100%',
          fontSize: fontSize(textBox.length),
          textAlign: 'left',
          padding: '0px',
          alignItems: 'flex-start',
        }}
        inputRef={inputRef}
        multiline
        onChange={checkTypeOfText}
        value={textBox}
        placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
        inputProps={{
          'aria-label': 'text to encrypt or decrypt',
        }}
      />
    </Box>
  );
};

export default TextEditor;
