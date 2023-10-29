import React, { useContext, useState } from "react";
import {
  Button, Card, Checkbox, List, ListItem, ListItemText,
  MenuItem, Select, Typography
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { getSyncItem, setLocalItem } from "../chrome/utils/storage";
import {Storage, ENCRYPTION_METHODS, KEY_LENGTHS, Action} from "../constants";
import FormDialog from "./Dialog"
import {AppContext} from "../contexts/AppContext";

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
  listItemText: {
    fontSize: 14,
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

export const Settings = () => {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const { api_key, enc_mode, theme, key_length } = state.settings;
  const [THEME, setTheme] = useState(state.settings.theme);

  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
  const keyLengthHandler = (e: any) => {
    // setSyncItem(Storage.KEY_LENGTH, e.target.value);
    dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, key_length: e.target.value} })
    // setKeyLength(e.target.value);
    //console.log(KEY_LENGTH)
  }

  const encModeHandler = (e: any) => {
    dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, enc_mode: e.target.value, } })
  }

  const clearHistory = (e: any) => {
    setLocalItem(Storage.HISTORY, []);
  }

  const themeHandler = (e: any) => {
    // setSyncItem(Storage.THEME, !theme);
    // dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, theme: false, } })
    const newTheme = {
      ...state.settings,
        theme: theme ? false : true,
    }
    // dispatch({type: Action.UPDATE_SETTINGS, payload: newTheme })
    dispatch({type: Action.UPDATE_THEME, payload: {theme: theme ? false : true}});

    setTheme(!THEME);
    console.log("Theme", newTheme, state.settings.theme, {statemodified: !theme, stateoriginal: theme});
  }

  const resetSettings = (e: any) => {
    dispatch({type: Action.RESET_SETTINGS, payload: null});
  }
  const signUp = () => {
    window.open("https://pastebin.com/doc_api")
  }

  return (
    <div>
      <Typography variant='h2' className={classes.pageHeading}>Settings</Typography>
      <List className={classes.list}>
        <Typography variant={'h4'}>Theme</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText
              primary="Dark Mode" />
            <Checkbox checked={theme} onChange={themeHandler} />
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Encryption</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="Encryption Algorithm" />
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
            </Select>
          </ListItem>
        </Card>

        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="Key Length" />

            {/* // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256 */}
            <Select
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
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Pastebin API</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="API Key" secondary={api_key ? api_key : "Not Set"} />
            <FormDialog APIKEY={api_key}/>
          </ListItem>
        </Card>


        <Typography variant={'h4'}>Reset</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText
              primary="Clear History" />
            <Button onClick={clearHistory}>Clear</Button>
          </ListItem>
        </Card>

        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText
              primary="Reset Settings" />
            <Button onClick={resetSettings}>Reset</Button>
          </ListItem>
        </Card>

      </List>
    </div>
  )
}
