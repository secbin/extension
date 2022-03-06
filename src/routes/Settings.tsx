import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";
import { Button, Card, Checkbox, Divider, IconButton, List, ListItem, ListItemText,
  MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
// import usePasteBinSearch from '../hooks/usePasteBinSearch'
import usePasteBinSearchJS from '../hooks/usePasteBinSearchJS'
import History from "./History";
import CustomizedMenus from "./DropDownButton";
import CustomizedInputBase from "./SmartTextBox";
import { ChevronRight } from "@mui/icons-material";
import { ConfigContext } from "../ConfigContext";
import { makeStyles, createStyles } from '@mui/styles';
import { setItem, getItem, Storage } from "../chrome/utils/storage";

function ErrorPage() {

  return (
    <h2> Sorry, the Decryption you were looking for is not valid. </h2>
  )
}

function CiphertextItem({ ciphertext }: any) {
  return (ciphertext ? (
    // <div>
    // {Object.keys(ciphertext).map((keyName, i) => (
    //
    //   <p> {ciphertext[i].success}</p>
    // ))};
    // </div>
    <p>Output goes Here</p>

  ) : <ErrorPage />

  )

}
function Ciphertext({ query }: any) {
  const [ciphertext, setCiphertext] = usePasteBinSearchJS(query);

  //  console.log(query);


  return (
    <div>
      <CiphertextItem ciphertext={ciphertext} />
    </div>

  )
}

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 6,
    border: '1px solid #E0E0E0',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    // backgroundColor: theme.palette.primary.light,
    // color: theme.palette.primary.contrastText,
    // boxShadow: "none",
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
  const [query, setQuery] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [responseFromContent, setResponseFromContent] = useState<string>('');
  const [ciphertext, setCiphertext] = useState([]);
  const [APIKEY, setApiKey] = useState("");
  const [ENC_MODE, setEncMode] = useState("");
  const [THEME, setTheme] = useState("");

  // const {appConfig, setAppConfig} = useContext(ConfigContext)
  //const [ciphertext, setCiphertext] = usePasteBinSearch(query);
  let { push } = useHistory();

  /**
   * Get current URL
   */
  useEffect(() => {

    getSettings();

    getCurrentTabUrl((url) => {
      setUrl(url || 'undefined');
    })
  }, []);


  const sendTestMessage = () => {
    const message: ChromeMessage = {
      from: Sender.React,
      message: "Hello from React",
    }

    getCurrentTabUId((id) => {
      id && chrome.tabs.sendMessage(
        id,
        message,
        (responseFromContentScript) => {
          setResponseFromContent(responseFromContentScript);
        });
    });
  };

  const sendRemoveMessage = () => {
    const message: ChromeMessage = {
      from: Sender.React,
      message: "delete logo",
    }

    getCurrentTabUId((id) => {
      id && chrome.tabs.sendMessage(
        id,
        message,
        (response) => {
          setResponseFromContent(response);
        });
    });
  };

  const encryptionMethods = [
      {
        prettyName: "AES CBC",
        value: "AES-CBC",
      },
      {
        prettyName: "AES CTR",
        value: "AES-CTR",
      },
      {
        prettyName: "AES GCM",
        value: "AES-GCM",
      },
      {
        prettyName: "3DES CBC",
        value: "3DES-CBC",
      }
  ];

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
              value="ARGON2_HASH"
              label={ENC_MODE}
            >
              {encryptionMethods.map((item) => (
                <MenuItem key={item.value}
                onClick={() => setItem(Storage.ENC_MODE, item.value)}
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
