import React, { useEffect, useContext } from "react";
import { AppContext } from "../contexts/AppContext";

import { Divider, Theme } from '@mui/material';

import {Action, Storage} from '../constants'
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from "react-router-dom";
import TextCounter from "../components/editor/TextCounter";
import EncryptFormDialog from "../components/dialog/EncDialog";
import DecryptFormDialog from "../components/dialog/DecDialog";
import DropDown from "../components/editor/DropDown";
import TextEditor from "../components/editor/TextEditor";
import SmartButton from "../components/editor/SmartButton";
import {useCreatePost} from "../hooks/useCreatePost";

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
    },
  settings: {
    api_key
  }} = state;

  let { push } = useHistory();

  const createPost = useCreatePost();


  useEffect(() => {
    if(passkey && dialog_id) {
      dispatch({ type: Action.CLOSE_DIALOG })
      createPost()
    }
  }, [passkey, dialog_id]);

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
