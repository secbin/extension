import React, {useContext} from "react";
import {
  Divider, Menu, MenuItem,
} from '@mui/material';
import {AppContext} from "../../contexts/AppContext";
import {Action} from "../../constants";
import KeyIcon from "@mui/icons-material/Key";
import KeyOffIcon from "@mui/icons-material/KeyOff";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LinkIcon from '@mui/icons-material/Link';
import AddLinkIcon from '@mui/icons-material/AddLink';
import {alpha, styled} from "@mui/material/styles";
import AddIcon from '@mui/icons-material/Add';

const DropDown = ({anchorEl, setAnchorEl, open}: any) => {
  const { state, dispatch } = useContext(AppContext);
  const { draft: {
    buttonEnabled,
    action: menu,
  },
    settings: {api_key:
        apiKey, encryption},
} = state;

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

  const handleClose = (text: Action.ENCRYPT | Action.DECRYPT | Action.DECRYPT_PASTEBIN | Action.ENCRYPT_PASTEBIN | Action.UNENCRYPT_PASTEBIN | Action.OPEN_PASTEBIN | Action.SAVE_DRAFT) => {
    setAnchorEl(null);
    dispatch({ type: Action.UPDATE_ENC_MENU, payload: { action: text, buttonEnabled: buttonEnabled } })
  };

  const EncryptionMenu = () => {
    return (
        <div>
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
              <KeyIcon className={'muted'} />
              {Action.ENCRYPT}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.ENCRYPT_PASTEBIN)} dense disableRipple>
              <KeyIcon className={'muted'} />
              {Action.ENCRYPT_PASTEBIN}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.UNENCRYPT_PASTEBIN)} dense disableRipple>
              <KeyOffIcon className={'muted'} />
              {Action.UNENCRYPT_PASTEBIN}
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={e => handleClose(Action.DECRYPT)} dense disableRipple>
              <LockOpenIcon className={'muted'} />
              {Action.DECRYPT}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.DECRYPT_PASTEBIN)} dense disableRipple>
              <LockOpenIcon className={'muted'} />
              {Action.DECRYPT_PASTEBIN}
            </MenuItem>
          </StyledMenu>
        </div>
    );
  }

  const RegularMenu = () => {
    return (
        <div>
          <StyledMenu
              /* @ts-ignore */
              anchorEl={anchorEl}
              open={open}
              onClose={(e: any) => handleClose(menu)}
          >
            <MenuItem sx={{ fontWeight: 700, color: 'grey' }} disabled dense disableRipple>
              Select Action
            </MenuItem>
            <MenuItem onClick={e => handleClose(Action.SAVE_DRAFT)} dense disableRipple>
              <EditNoteIcon className={'muted'} />
              {Action.SAVE_DRAFT}
            </MenuItem>
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.UNENCRYPT_PASTEBIN)} dense disableRipple>
              <AddIcon className={'muted'} />
              Post to Pastebin
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem disabled={ !!!apiKey } onClick={e => handleClose(Action.OPEN_PASTEBIN)} dense disableRipple>
              <LinkIcon className={'muted'} />
              {Action.OPEN_PASTEBIN}
            </MenuItem>
          </StyledMenu>
        </div>
    );
  }


  return (
      <div>
        { encryption ? <EncryptionMenu /> : <RegularMenu /> }
      </div>
  );
}

export default DropDown;
