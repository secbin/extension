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
  const [apiKey, setApiKey] = useState("");

  // const {appConfig, setAppConfig} = useContext(ConfigContext)
  //const [ciphertext, setCiphertext] = usePasteBinSearch(query);
  let { push } = useHistory();

  /**
   * Get current URL
   */
  useEffect(() => {

    getDataWrapper(Storage.API_KEY);

    getCurrentTabUrl((url) => {
      setUrl(url || 'undefined');
    })
  }, []);


  // console.log("GETTING API KEY: ", getDataWrapper(Storage.API_KEY))

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
        prettyName: "argon2",
        value: "ARGON2_HASH",
      },
      {
        prettyName: "sha2",
        value: "SHA2_HASH",
      },
  ];


  const getSetting = (key: string) =>{
    getItem(key, (data) => {
      const res = data[Storage.ENC_MODE] || []
      console.log(res); // returns nothing
      return res;
    })
    return "Not Set"
  };

function getDataWrapper(key: string):any {
  getItem(key, (data) => {
      const res = data[key] || []
      if(res) {
        setApiKey(res);
      }
      // alert(res)
      console.log("res", res); // returns something
      return res
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
              onClick={() => setItem(Storage.ENC_MODE, "AES-GCM")}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value="ARGON2_HASH"
              label="AES-GCM"
            >
              {encryptionMethods.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.prettyName}</MenuItem>
              ))}
            </Select>
          </ListItem>
        </Card>

        <Typography variant={'h4'}>Pastebin API</Typography>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText primary="PasteBin API Key" secondary={apiKey} />
            {/*<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />*/}
            <IconButton color="primary" sx={{ p: '10px' }} 
              aria-label="directions" 
             >
              <ChevronRight />
            </IconButton>
          </ListItem>
          <TextField placeholder={apiKey}> </TextField>
          <Button onClick={() => setItem(Storage.API_KEY, "23ourwfodifkhjklfquhdkajdh")}>
            Set New Api Key
          </Button>
        </Card>
      </List>
    </div>
  )
}
