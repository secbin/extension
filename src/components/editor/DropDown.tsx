import React, { useContext } from 'react';
import { Divider, Menu, MenuItem, MenuProps } from '@mui/material';
import { AppContext } from '../../contexts/AppContext';
import { Action } from '../../constants';
import KeyIcon from '@mui/icons-material/Key';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LinkIcon from '@mui/icons-material/Link';
import { alpha, styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

type DropDownProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  open: boolean;
};

const StyledMenu = styled(({ ...props }: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    // TODO(rewrite): minWidth as inline style works around an emotion flush timing race —
    // MUI's useLayoutEffect measures offsetWidth before the CSS class min-width is in the DOM
    // in standalone mode, causing the menu to render off-screen right. See README § Known issues.
    PaperProps={{ style: { minWidth: 210 } }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
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
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const DropDown = ({ anchorEl, setAnchorEl, open }: DropDownProps) => {
  const { state, dispatch } = useContext(AppContext);
  const {
    draft: { buttonEnabled, action: menu },
    settings: { api_key: apiKey, encryption },
  } = state;

  const isInjected =
    (window as Window & { __SECUREBIN_INJECTED__?: boolean })
      .__SECUREBIN_INJECTED__ === true;

  const portalContainer = isInjected
    ? (window as Window & { __SECUREBIN_PORTAL__?: HTMLElement })
        .__SECUREBIN_PORTAL__
    : undefined;

  const handleClose = (
    text:
      | Action.ENCRYPT
      | Action.DECRYPT
      | Action.DECRYPT_PASTEBIN
      | Action.ENCRYPT_PASTEBIN
      | Action.UNENCRYPT_PASTEBIN
      | Action.OPEN_PASTEBIN
      | Action.SAVE_DRAFT
  ) => {
    setAnchorEl(null);
    dispatch({
      type: Action.UPDATE_ENC_MENU,
      payload: { action: text, buttonEnabled: buttonEnabled },
    });
  };

  const menuProps = {
    anchorEl,
    open,
    onClose: () => handleClose(menu),
    ...(portalContainer ? { container: portalContainer } : {}),
  };

  return (
    <StyledMenu {...menuProps}>
      <MenuItem
        sx={{ fontWeight: 700, color: 'grey' }}
        disabled
        dense
        disableRipple
      >
        Select Action
      </MenuItem>
      {encryption ? (
        <>
          <MenuItem
            onClick={() => handleClose(Action.ENCRYPT)}
            dense
            disableRipple
          >
            <KeyIcon />
            {Action.ENCRYPT}
          </MenuItem>
          <MenuItem
            disabled={!apiKey}
            onClick={() => handleClose(Action.ENCRYPT_PASTEBIN)}
            dense
            disableRipple
          >
            <KeyIcon />
            {Action.ENCRYPT_PASTEBIN}
          </MenuItem>
          <MenuItem
            disabled={!apiKey}
            onClick={() => handleClose(Action.UNENCRYPT_PASTEBIN)}
            dense
            disableRipple
          >
            <KeyOffIcon />
            {Action.UNENCRYPT_PASTEBIN}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => handleClose(Action.DECRYPT)}
            dense
            disableRipple
          >
            <LockOpenIcon />
            {Action.DECRYPT}
          </MenuItem>
          <MenuItem
            disabled={!apiKey}
            onClick={() => handleClose(Action.DECRYPT_PASTEBIN)}
            dense
            disableRipple
          >
            <LockOpenIcon />
            {Action.DECRYPT_PASTEBIN}
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem
            onClick={() => handleClose(Action.SAVE_DRAFT)}
            dense
            disableRipple
          >
            <EditNoteIcon />
            {Action.SAVE_DRAFT}
          </MenuItem>
          <MenuItem
            disabled={!apiKey}
            onClick={() => handleClose(Action.UNENCRYPT_PASTEBIN)}
            dense
            disableRipple
          >
            <AddIcon />
            Post to Pastebin
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            disabled={!apiKey}
            onClick={() => handleClose(Action.OPEN_PASTEBIN)}
            dense
            disableRipple
          >
            <LinkIcon />
            {Action.OPEN_PASTEBIN}
          </MenuItem>
        </>
      )}
    </StyledMenu>
  );
};

export default DropDown;
