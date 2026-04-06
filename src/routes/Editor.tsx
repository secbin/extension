import React, { useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Divider, Box } from '@mui/material';
import { Action } from '../constants';
import TextCounter from '../components/editor/TextCounter';
import EncryptFormDialog from '../components/dialog/EncDialog';
import DecryptFormDialog from '../components/dialog/DecDialog';
import DropDown from '../components/editor/DropDown';
import TextEditor from '../components/editor/TextEditor';
import SmartButton from '../components/editor/SmartButton';
import { useCreatePost } from '../hooks/useCreatePost';

export default function Editor() {
  const { state, dispatch } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const {
    draft: { action: menu, key: passkey },
    app: { dialog_id },
  } = state;

  const createPost = useCreatePost();

  useEffect(() => {
    if (passkey && dialog_id) {
      dispatch({ type: Action.CLOSE_DIALOG });
      createPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passkey, dialog_id]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <TextEditor />
      <Divider />
      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        <TextCounter textLength={state.draft.plaintext.length} menu={menu} />
        <SmartButton open={open} setAnchorEl={setAnchorEl} />
        <DropDown anchorEl={anchorEl} setAnchorEl={setAnchorEl} open={open} />
        <DecryptFormDialog />
        <EncryptFormDialog />
      </Box>
    </Box>
  );
}
