import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";
import { Button, TextField, Typography } from "@mui/material";
// import usePasteBinSearch from '../hooks/usePasteBinSearch'
// import usePasteBinSearchJS from '../hooks/usePasteBinSearchJS'
import History from "./History";
import CustomizedMenus from "./DropDownButton";
import CustomizedInputBase from "./SmartTextBox";
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
// function Ciphertext({query}:any){
//   // const [ciphertext, setCiphertext] = usePasteBinSearchJS(query);
//
// //  console.log(query);
//
//
//   return(
//     <div>
//       <CiphertextItem ciphertext={ciphertext}/>
//     </div>
//
//   )
// }

export const NewHome = () => {
    const [query, setQuery] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [responseFromContent, setResponseFromContent] = useState<string>('');
    const [ciphertext, setCiphertext] = useState([]);
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
                <Typography variant="h6" component="h6">
                    Paste in an existing pastebin link, plain text, or text you want to decrypt or encrypt.
                </Typography>
                <CustomizedInputBase/>
                <CustomizedMenus />
                <History />
                {/*<button onClick={sendTestMessage}>SEND MESSAGE</button>*/}
                {/*<button onClick={sendRemoveMessage}>Remove logo</button>*/}
                {/*<form  onSubmit={(e) => {*/}
                {/*  e.preventDefault();*/}
                {/*    console.log(inputValue);*/}
                {/*    setQuery(inputValue);*/}

                {/*}}>*/}
                {/*  <input value={inputValue} placeholder="Enter The Paste Bin Key" onChange={e => setInputValue(e.target.value)} />*/}
                {/*  <button type="submit">Decrypt</button>*/}
                {/*</form>*/}
                {/*<p>Response from content:</p>*/}
                {/*<p>*/}
                {/*    {responseFromContent}*/}
                {/*</p>*/}
                {/*<div>*/}
                {/*    <Ciphertext query={query}/>*/}
                {/*</div>*/}
                {/*<button onClick={() => {*/}
                {/*    push('/about')*/}
                {/*}}>About page*/}
                {/*</button>*/}
            </header>
        </div>
    )
}
