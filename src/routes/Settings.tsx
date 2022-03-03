import React, {useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";
import { Button, Checkbox, Divider, IconButton, List, ListItem, ListItemText, Paper, Select, TextField, Typography } from "@mui/material";
// import usePasteBinSearch from '../hooks/usePasteBinSearch'
import usePasteBinSearchJS from '../hooks/usePasteBinSearchJS'
import History from "./History";
import CustomizedMenus from "./DropDownButton";
import CustomizedInputBase from "./SmartTextBox";
import { ChevronRight } from "@mui/icons-material";
import { ConfigContext } from "../ConfigContext";
function ErrorPage(){

  return (
    <h2> Sorry, the Decryption you were looking for is not valid. </h2>
  )
}

function CiphertextItem({ciphertext}:any){
return ( ciphertext ? (
  // <div>
  // {Object.keys(ciphertext).map((keyName, i) => (
  //
  //   <p> {ciphertext[i].success}</p>
  // ))};
  // </div>
  <p>Output goes Here</p>

): <ErrorPage/>

)

}
function Ciphertext({query}:any){
  const [ciphertext, setCiphertext] = usePasteBinSearchJS(query);

//  console.log(query);


  return(
    <div>
      <CiphertextItem ciphertext={ciphertext}/>
    </div>

  )
}

export const Settings = () => {
    const [query, setQuery] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [responseFromContent, setResponseFromContent] = useState<string>('');
    const [ciphertext, setCiphertext] = useState([]);

    // const {appConfig, setAppConfig} = useContext(ConfigContext)
    //const [ciphertext, setCiphertext] = usePasteBinSearch(query);
    let {push} = useHistory();

    /**
     * Get current URL
     */
    useEffect(() => {
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


    return (
        <div className="App">
            <header className="App-header">
                <List sx={{ width: '100%', maxWidth: 360 }}>
                    <Paper style={{margin: "6px", textAlign: 'left'}}>

                    <ListItem>
                            <ListItemText primary="Dark Mode" secondary="Enabled" />
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <Checkbox defaultChecked />
                    </ListItem>
                    </Paper>

                <Paper style={{margin: "6px", textAlign: 'left'}}>
                    <ListItem>
                        <ListItemText primary="Encryption Algorithm" secondary="argon2" />
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value="argon2"
                            label="Age"
                        />
                    </ListItem>
                </Paper>
                <Paper style={{margin: "6px", textAlign: 'left'}}>
                    <ListItem>
                        <ListItemText primary="PasteBin API Key" secondary="23ourwfodifkhjklfquhdkajdh" />
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                            <ChevronRight />
                        </IconButton>
                    </ListItem>
                </Paper>
                </List>
            </header>
        </div>
    )
}
