import React, { useContext, useState } from "react";
import {
  Button, Checkbox, List, MenuItem, Select, Typography
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { setLocalItem } from "../chrome/utils/storage";
import { Storage, ENCRYPTION_METHODS, KEY_LENGTHS, Action } from "../constants";
import FormDialog from "../components/Dialog"
import { AppContext } from "../contexts/AppContext";
import SettingsItem from "../components/SettingsItem";

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
  const { api_key, enc_mode, theme, key_length } = state.settings;
  const [THEME, setTheme] = useState(state.settings.theme);

  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
  const keyLengthHandler = (e: any) => {
    dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, key_length: e.target.value} })
  }

  const encModeHandler = (e: any) => {
    dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, enc_mode: e.target.value, } })
  }

  const clearHistory = (e: any) => {
    setLocalItem(Storage.HISTORY, []);
  }

  const themeHandler = (e: any) => {
    const newTheme = {
      ...state.settings,
        theme: theme ? false : true,
    }
    dispatch({type: Action.UPDATE_THEME, payload: {theme: theme ? false : true}});

    setTheme(!THEME);
    console.log("Theme", newTheme, state.settings.theme, {statemodified: !theme, stateoriginal: theme});
  }

  const resetSettings = (e: any) => {
    dispatch({type: Action.RESET_SETTINGS, payload: null});
  }

  return (
    <div>
      <Typography variant='h2' className={classes.pageHeading}>Settings</Typography>
      <List className={classes.list}>
        <Typography variant={'h4'}>Theme</Typography>
        <SettingsItem
            primary={'Dark Mode'}
            children={<Checkbox checked={theme} onChange={themeHandler} />}
        />

        <Typography variant={'h4'}>Encryption</Typography>
        <SettingsItem
            primary={'Encryption Algorithm'}
            children={(
              <Select
                className={classes.select}
                value={enc_mode}
                onChange={encModeHandler}
              >
              {ENCRYPTION_METHODS.map((item) => (
                  <MenuItem classes={{ root: classes.menuItem }}
                            key={item.value}
                            value={item.value}>{item.name}
                  </MenuItem>
              ))}
            </Select>)}
        />

        <SettingsItem
            primary={'Key Length'}
            children={(
              <Select
                  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
                  className={classes.select}
                  value={key_length}
                  onChange={keyLengthHandler}
                >
                  {KEY_LENGTHS.map((item) => (
                      <MenuItem className={classes.menuItem}
                                key={item.value}
                                value={item.value}>{item.name}
                      </MenuItem>
                  ))}
                </Select>
            )}
        />

        <Typography variant={'h4'}>Pastebin API</Typography>
        <SettingsItem
            primary={'API Key'}
            secondary={api_key ? api_key : "Not Set"}
            children={(
                <FormDialog APIKEY={api_key}/>
            )}
        />


        <Typography variant={'h4'}>Reset</Typography>
        <SettingsItem
            primary={'Clear History'}
            secondary={api_key ? api_key : 'Not Set'}
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
