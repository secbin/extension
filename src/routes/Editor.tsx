import React, { useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

import { Divider } from '@mui/material';

import { Action } from '../constants';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TextCounter from '../components/editor/TextCounter';
import EncryptFormDialog from '../components/dialog/EncDialog';
import DecryptFormDialog from '../components/dialog/DecDialog';
import DropDown from '../components/editor/DropDown';
import TextEditor from '../components/editor/TextEditor';
import SmartButton from '../components/editor/SmartButton';
import { useCreatePost } from '../hooks/useCreatePost';

const useStyles = makeStyles(() => ({
  bottomSection: {
    display: 'flex',
  },
  animated: {
    transition: 'all 0.25s',
  },
  muted: {
    color: 'rgba(0,0,0,0.3)',
  },
}));

export default function Editor() {
  const classes = useStyles();
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
    <>
      <div>
        <TextEditor />
        <Divider />
        <Box className={classes.bottomSection}>
          <TextCounter textLength={state.draft.plaintext.length} menu={menu} />
          <SmartButton open={open} setAnchorEl={setAnchorEl} />
          <DropDown anchorEl={anchorEl} setAnchorEl={setAnchorEl} open={open} />
          <DecryptFormDialog />
          <EncryptFormDialog />
        </Box>
      </div>
    </>
  );
}
