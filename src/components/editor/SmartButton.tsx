import React, { useContext } from 'react';
import {
  Box,
  Card,
  IconButton,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { AppContext, DraftActionValue } from '../../contexts/AppContext';
import { Action } from '../../constants';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCreatePost } from '../../hooks/useCreatePost';

type SmartButtonProps = {
  setAnchorEl: (el: HTMLElement | null) => void;
  open: boolean;
};

const encryptionMap: Partial<Record<Action, Action>> = {
  [Action.SEND_TO_PASTEBIN]: Action.ENCRYPT_PASTEBIN,
  [Action.OPEN_PASTEBIN]: Action.DECRYPT_PASTEBIN,
  [Action.SAVE_DRAFT]: Action.ENCRYPT,
};

const plainMap: Partial<Record<Action, Action>> = {
  [Action.ENCRYPT_PASTEBIN]: Action.SEND_TO_PASTEBIN,
  [Action.DECRYPT_PASTEBIN]: Action.OPEN_PASTEBIN,
  [Action.ENCRYPT]: Action.SAVE_DRAFT,
};

const SmartButton = ({ setAnchorEl, open }: SmartButtonProps) => {
  const { state, dispatch } = useContext(AppContext);
  const {
    draft: { buttonEnabled, action: menu },
    settings: { encryption },
  } = state;

  const createPost = useCreatePost();

  const getButtonText = (): Action => {
    if (Object.prototype.hasOwnProperty.call(plainMap, menu) && !encryption) {
      return plainMap[menu] ?? menu;
    } else if (
      Object.prototype.hasOwnProperty.call(encryptionMap, menu) &&
      encryption
    ) {
      return encryptionMap[menu] ?? menu;
    }
    return menu;
  };

  // TODO(rewrite): stopPropagation prevents the opening click from bubbling to document
  // where MUI's ClickAwayListener would see it and immediately close the menu.
  // Verify this holds in injected mode (shadow DOM composed path may differ). See README § Known issues.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const actionWrapper = async (e: React.MouseEvent<HTMLElement>) => {
    const buttonText = (e.target as HTMLElement).innerText || '';
    dispatch({
      type: Action.SET_ACTION,
      payload: { action: (buttonText as DraftActionValue) || getButtonText() },
    });
    if (
      buttonText === Action.DECRYPT_PASTEBIN ||
      buttonText === Action.DECRYPT
    ) {
      dispatch({
        type: Action.OPEN_DIALOG,
        payload: { dialog_id: 'dec_form' },
      });
    } else if (
      buttonText === Action.ENCRYPT_PASTEBIN ||
      buttonText === Action.ENCRYPT
    ) {
      dispatch({
        type: Action.OPEN_DIALOG,
        payload: { dialog_id: 'enc_form' },
      });
    } else if (
      buttonText === Action.UNENCRYPT_PASTEBIN ||
      buttonText === Action.SAVE_DRAFT ||
      buttonText === Action.OPEN_PASTEBIN
    ) {
      await createPost();
    }
  };

  return (
    <Card
      sx={{ transition: 'all 0.25s' }}
      style={{
        minWidth: 100,
        textAlign: 'center',
        backgroundColor: '#1D6BC6',
        color: '#fff',
        margin: 15,
        borderRadius: 50,
        marginLeft: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemButton
          sx={{
            ml: 1,
            flex: 1,
            height: 40,
            textAlign: 'center',
            fontWeight: 800,
            transition: 'all 0.10s',
          }}
          onClick={actionWrapper}
          aria-controls={open ? 'Select type of action' : undefined}
          aria-haspopup="true"
          disabled={!buttonEnabled}
          aria-expanded={open ? 'true' : undefined}
        >
          <ListItemText sx={{ transition: 'all 0.25s' }}>
            {getButtonText()}
          </ListItemText>
        </ListItemButton>
        <IconButton
          sx={{ p: '10px', opacity: 0.85, color: '#fff' }}
          onClick={handleClick}
          disableRipple
          aria-label="encryption/decryption options"
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default SmartButton;
