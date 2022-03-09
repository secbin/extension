import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Checkbox, Divider, IconButton, List, ListItem, ListItemText,
         MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { ConfigContext } from "../ConfigContext";
import { makeStyles, createStyles } from '@mui/styles';
import { setItem, getItem } from "../chrome/utils/storage";
import { Storage, ENCRYPTION_METHODS, KEY_LENGTHS } from "../constants";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 6,
    border: '1px solid #E0E0E0',
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
  }
}));

export const Settings = () => {
  const classes = useStyles();
  const [APIKEY, setApiKey] = useState("");
  const [ENC_MODE, setEncMode] = useState("");
  const [THEME, setTheme] = useState("");
  const [KEY_LENGTH, setKeyLength] = useState("");

  useEffect(() => {
    getSettings();
  }, []);

  // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
function getSettings():any {
  getItem(Storage.API_KEY, (data) => {
      setApiKey(data[Storage.API_KEY]);
  })

  getItem(Storage.ENC_MODE, (data) => {
    setEncMode(data[Storage.ENC_MODE]);
  })

  getItem(Storage.THEME, (data) => {
    setTheme(data[Storage.THEME]);
  })

  getItem(Storage.KEY_LENGTH, (data) => {
    setKeyLength(data[Storage.KEY_LENGTH]);
  })
}

  return (
    <div>
      <Typography variant='h2' className={classes.pageHeading} >Settings</Typography>
      <List className={classes.list}>
        <Typography variant={'h4'}>Dark Mode</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText
              primary="Dark Mode" />
            {/*<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />*/}
            <Checkbox defaultChecked onClick={() => setItem(Storage.THEME, true)} />
          </ListItem>
        </Card>

        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="Encryption Algorithm" />
            {/*<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />*/}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={ENC_MODE}
              label={ENC_MODE}
            >
              {ENCRYPTION_METHODS.map((item) => (
                <MenuItem key={item.value}
                onClick={() => setItem(Storage.ENC_MODE, item.value)}
                value={item.value}>{item.prettyName}
                </MenuItem>
              ))}
            </Select>

            {/* // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256 */}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={KEY_LENGTH}
              label={KEY_LENGTH}
            >
              {KEY_LENGTHS.map((item) => (
                <MenuItem key={item.value}
                onClick={() => setItem(Storage.KEY_LENGTH, item.value)}
                value={item.value}>{item.prettyName}
                </MenuItem>
              ))}
            </Select>
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Pastebin API</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="PasteBin API Key" secondary={APIKEY} />
            {/*<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />*/}
            <IconButton color="primary" sx={{ p: '10px' }} 
              aria-label="directions" 
             >
              <ChevronRight />
            </IconButton>
          </ListItem>
          <TextField placeholder={APIKEY}> </TextField>
          <Button onClick={() => setItem(Storage.API_KEY, "23ourwfodifkhjklfquhdkajdh")}>
            Set New Api Key
          </Button>
        </Card>
      </List>
    </div>
  )
}
