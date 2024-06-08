import React, { useContext, useState } from "react";
import {
  Button, Checkbox, List, MenuItem, Select, Typography
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { setLocalItem } from "../chrome/utils/storage";
import { Storage, ENCRYPTION_METHODS, KEY_LENGTHS, Action } from "../constants";
import FormDialog from "../components/dialog/ButtonRedirect"
import { AppContext } from "../contexts/AppContext";
import SettingsItem from "../components/SettingsItem";
import ButtonRedirect from "../components/dialog/ButtonRedirect";
import WarningDialog from "../components/dialog/WarningDialog";
import ResetWarningDialog from "../components/dialog/ResetWarningDialog";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
  pageHeading: {
    paddingLeft: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  list: {
    padding: 20,
  },
  menuItem: {
    height: 10,
    boxShadow: "none"
  },
  select: {
    height: 32,
    marginBottom: 8,
    marginTop: 8,
  }
}));

export default function Settings() {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const { api_key, enc_mode, theme, key_length, encryption } = state.settings;
  // const [THEME, setTheme] = useState(state.settings.theme);

  const clearHistory = (e: any) => {
    dispatch({ type: Action.OPEN_DIALOG, payload: { dialog_id: 'reset_history' } })
  }

  const themeHandler = (e: any) => {
    const newTheme = {
      ...state.settings,
        theme: theme ? false : true,
    }
    dispatch({type: Action.UPDATE_THEME, payload: {theme: theme ? false : true}});

    // setTheme(!THEME);
    console.log("Theme", newTheme, state.settings.theme, {statemodified: !theme, stateoriginal: theme});
  }


  const resetSettings = (e: any) => {
    dispatch({ type: Action.OPEN_DIALOG, payload: { dialog_id: 'reset_settings' } })
  }

  return (
    <div>
      <WarningDialog />
      <ResetWarningDialog />
      <Typography variant='h2' className={classes.pageHeading}>Settings</Typography>
      <List className={classes.list}>
        <Typography variant={'h4'}>Theme</Typography>
        <SettingsItem
            primary={'Dark Mode'}
            children={<Checkbox checked={theme} onChange={themeHandler} />}
        />

        <Typography variant={'h4'}>Encryption</Typography>
        <SettingsItem
            primary={'Encryption'}
            secondary={encryption ? `Enabled with ${key_length * 8}-bit ${enc_mode} ` : 'Disabled'}
            children={(
                <ButtonRedirect iconButton value={"Configure"} url={'/encconfig'}/>
            )}
        />

        <Typography variant={'h4'}>Pastebin API</Typography>
        <SettingsItem
            primary={'API Key'}
            secondary={api_key ? 'Set' : "Not Set"}
            children={(
                <ButtonRedirect iconButton value={api_key ? "Change" : "Set Key"} url={'/apikey'}/>
            )}
        />

        <Typography variant={'h4'}>Help</Typography>
        <SettingsItem
            primary={'Support'}
            children={(
                <ButtonRedirect iconButton value={"Get Help"} url={'/support'}/>
            )}
        />


        <Typography variant={'h4'}>Reset</Typography>
        <SettingsItem
            primary={'Clear History'}
            children={(
                <Button onClick={clearHistory}>Clear</Button>
            )}
        />

        <SettingsItem
            primary={'Reset Settings'}
            children={(
                <Button onClick={resetSettings}>Reset</Button>
            )}
        />
      </List>
    </div>
  )
}
