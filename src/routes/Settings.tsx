import React, { useContext, useEffect, useState } from "react";
import {
  Button, Card, Checkbox, Divider, IconButton, List, ListItem, ListItemText,
  MenuItem, Paper, Select, TextField, Typography
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { makeStyles, createStyles } from '@mui/styles';
import { setSyncItem, getSyncItem, setLocalItem } from "../chrome/utils/storage";
import { Storage, ENCRYPTION_METHODS, KEY_LENGTHS, DEFAULT_CONTEXT } from "../constants";
import FormDialog from "./Dialog"

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
  const [APIKEY, setApiKey] = useState("");
  const [ENC_MODE, setEncMode] = useState("");
  const [THEME, setTheme] = useState(false);
  const [KEY_LENGTH, setKeyLength] = useState("");

  useEffect(() => {
    getSettings();
  }, []);

  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
  function getSettings(): any {
    getSyncItem(Storage.API_KEY, (data) => {
      setApiKey(data[Storage.API_KEY]);
      //console.log(APIKEY)
    })

    getSyncItem(Storage.ENC_MODE, (data) => {
      setEncMode(data[Storage.ENC_MODE]);
      //console.log(ENC_MODE)
    })

    getSyncItem(Storage.THEME, (data) => {
      setTheme(data[Storage.THEME]);
      //console.log("Getting theme", data[Storage.THEME])
    })

    getSyncItem(Storage.KEY_LENGTH, (data) => {
      setKeyLength(data[Storage.KEY_LENGTH]);
      //console.log(KEY_LENGTH)
    })
  }

  const keyLengthHandler = (e: any) => {
    setSyncItem(Storage.KEY_LENGTH, e.target.value)
    setKeyLength(e.target.value);
    //console.log(KEY_LENGTH)

    getSyncItem(Storage.KEY_LENGTH, (data) => {
      //console.log(KEY_LENGTH)
    })
  }

  const encModeHandler = (e: any) => {
    setSyncItem(Storage.ENC_MODE, e.target.value);
    setEncMode(e.target.value);
  }

  const clearHistory = (e: any) => {
    setLocalItem(Storage.HISTORY, []);
  }

  const themeHandler = (e: any) => {
    setSyncItem(Storage.THEME, !THEME);
    setTheme(!THEME);
  }

  const resetSettings = (e: any) => {
    const d = DEFAULT_CONTEXT;

    setSyncItem(Storage.THEME, d.theme);
    setSyncItem(Storage.API_KEY, d.api_key);
    setSyncItem(Storage.ENC_MODE, d.enc_mode);
    setSyncItem(Storage.KEY_LENGTH, d.key_length);

    setEncMode(d.enc_mode);
    setKeyLength(String(d.key_length));
    setApiKey(d.api_key);
    setTheme(d.theme);

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
            <Checkbox checked={THEME} onChange={themeHandler} />
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Encryption</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="Encryption Algorithm" />
            <Select
              className={classes.select}
              value={ENC_MODE}
              label={ENC_MODE}
              onChange={encModeHandler}
            >
              {ENCRYPTION_METHODS.map((item) => (
                <MenuItem classes={{ root: classes.menuItem }}
                  key={item.value}
                  value={item.value}>{item.prettyName}
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
              value={KEY_LENGTH}
              onChange={keyLengthHandler}
            >
              {KEY_LENGTHS.map((item) => (
                <MenuItem className={classes.menuItem}
                  key={item.value}
                  value={item.value}>{item.prettyName}
                </MenuItem>
              ))}
            </Select>
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Pastebin API</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="API Key" secondary={APIKEY ? APIKEY : "Not Set"} />
            <FormDialog APIKEY={APIKEY}/>
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
