import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Action, Storage } from '../constants';
import { decrypt, encrypt } from '../chrome/utils/crypto';
import { getPastebin, postPastebin } from '../chrome/utils/pastebin';
import { addLocalItem } from '../chrome/utils/storage';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export function useCreatePost() {
  const { state, dispatch } = useContext(AppContext);
  let { push } = useHistory();

  const {
    draft: { buttonEnabled, action: menu, key: passkey, plaintext: text },
    settings: { api_key },
  } = state;

  const createPost = async () => {
    const currentMenu = menu;

    if (currentMenu === Action.ENCRYPT_PASTEBIN) {
      let res = await encrypt(text, passkey);
      let newNewlink = await postPastebin(res.data, api_key);
      const history = {
        action: Action.ENCRYPT_PASTEBIN,
        id: uuidv4(),
        pastebinlink: newNewlink,
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      };

      dispatch({ type: Action.ADD_TO_HISTORY, payload: history });
      addLocalItem(Storage.HISTORY, history);
      dispatch({ type: Action.RESET_DRAFT, payload: null });

      push('/result');
    } else if (currentMenu === Action.UNENCRYPT_PASTEBIN) {
      let newNewlink = await postPastebin(text, api_key);
      const history = {
        action: Action.ENCRYPT_PASTEBIN,
        id: uuidv4(),
        pastebinlink: newNewlink,
        key: null,
        enc_text: text,
        enc_mode: null,
        key_length: null,
        date: new Date().getTime(),
      };

      console.log('NEW NEW LINK UNENCRYPT', history);

      dispatch({ type: Action.ADD_TO_HISTORY, payload: history });
      addLocalItem(Storage.HISTORY, history);
      dispatch({ type: Action.RESET_DRAFT, payload: null });

      push('/result');
    } else if (currentMenu === Action.ENCRYPT) {
      let res = await encrypt(text, passkey);
      const history = {
        action: Action.ENCRYPT,
        pastebinlink: '',
        id: uuidv4(),
        key: res.key,
        enc_text: res.data,
        enc_mode: res.mode,
        key_length: res.key_len,
        date: new Date().getTime(),
      };

      dispatch({ type: Action.ADD_TO_HISTORY, payload: history });
      addLocalItem(Storage.HISTORY, history);
      dispatch({ type: Action.RESET_DRAFT, payload: null });
      push('/result');
    } else if (currentMenu === Action.SAVE_DRAFT) {
      const history = {
        action: Action.SAVE_DRAFT,
        pastebinlink: '',
        id: uuidv4(),
        key: null,
        enc_text: text,
        enc_mode: null,
        key_length: null,
        date: new Date().getTime(),
      };

      dispatch({ type: Action.ADD_TO_HISTORY, payload: history });
      addLocalItem(Storage.HISTORY, history);
      dispatch({ type: Action.RESET_DRAFT, payload: null });
      push('/result');
    } else if (currentMenu === Action.DECRYPT_PASTEBIN) {
      console.log('TEST DECRYPT');
      if (passkey !== '') {
        let pasteText = await getPastebin(text);
        if (pasteText) {
          let res = decrypt(pasteText, passkey);
          dispatch({
            type: Action.UPDATE_PLAINTEXT,
            payload: {
              plaintext: res,
              action: currentMenu,
              buttonEnabled: buttonEnabled,
            },
          });
        }
      }
    } else if (currentMenu === Action.OPEN_PASTEBIN) {
      console.log('TEST PLAIN');
      let pasteText = await getPastebin(text);
      if (pasteText) {
        dispatch({
          type: Action.UPDATE_PLAINTEXT,
          payload: {
            plaintext: pasteText,
            action: currentMenu,
            buttonEnabled: buttonEnabled,
          },
        });
      }
    } else if (currentMenu === Action.DECRYPT) {
      console.log('PASSKEY IS', passkey);
      if (passkey !== '') {
        let res = decrypt(text, passkey);
        dispatch({
          type: Action.UPDATE_PLAINTEXT,
          payload: {
            plaintext: res,
            action: currentMenu,
            buttonEnabled: buttonEnabled,
          },
        });
      }
    }
  };

  return createPost;
}
