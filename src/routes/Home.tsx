import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";

import { Button, TextField } from "@mui/material";

import usePasteBinSearchJS from '../hooks/usePasteBinSearchJS'
import usePasteBinPost from '../hooks/usePasteBinPost';


function ErrorPage(){

  return (
    <h2> Sorry, the Decryption you were looking for is not valid. </h2>
  )
}


//This represents the text to be displayed for a plaintext or a ciphertext
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

// This function takes in the plaintext from the form
// encryptQuery is the Plaintext
//usePasteBinPost is the hook for posting to pasteBin
// PasteBinLink is the link returned from the post request.
function Plaintext({encryptQuery}:any){
  //
  //const [pasteBinLink, error] = usePasteBinPost(encryptQuery);

  //console.log(encryptQuery);


  return(
    // <div>
    // <CiphertextItem ciphertext={pasteBinLink}/>
    // </div>
    <p> Figure out how to fix the post request being called from the start. </p>

  )
}

//This function gets the ciphertext from pasteBin
// The ciphertext is stored in the ciphertext state  variable
function Ciphertext({query}:any){
  const [ciphertext, setCiphertext] = usePasteBinSearchJS(query);

//  console.log(query);


  return(
    <div>
      <CiphertextItem ciphertext={ciphertext}/>
    </div>

  )
}

export const Home = () => {
    const [query, setQuery] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [encryptQuery, setEncryptQuery] = useState<string>('');
    const [encryptValue, setEncryptValue] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [responseFromContent, setResponseFromContent] = useState<string>('');
    const [ciphertext, setCiphertext] = useState([]);
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
// This handles submitting the plaintext to the state variable from the form when the button is clicked.
function encryptSubmit(e:any){
  e.preventDefault();
    console.log("Encrypt Value: "+ encryptValue);
    setEncryptQuery(encryptValue);
}
    return (
        <div className="App">
            <header className="App-header">
                <p>Home</p>
                <p>URL:</p>
                <p>
                    {url}
                </p>
                <form>
                <input value={encryptValue} id="outlined-basic"  onChange={e => setEncryptValue(e.target.value)}/>
                <Button type="submit" onClick={encryptSubmit} >Encrypt</Button>
                </form>

                <form  onSubmit={(e) => {
                  e.preventDefault();
                    console.log(inputValue);
                    setQuery(inputValue);

                }}>
                  <input value={inputValue} placeholder="Enter The Paste Bin Key" onChange={e => setInputValue(e.target.value)} />
                  <button  type="submit">Decrypt</button>
                </form>
                <button onClick={sendTestMessage}>SEND MESSAGE</button>
                <button onClick={sendRemoveMessage}>Remove logo</button>
                <p>Response from content:</p>
                <p>
                    {responseFromContent}
                </p>
                <div>
                    <Ciphertext query={query}/>
                </div>
                <div>
                    <Plaintext encryptQuery={encryptQuery}/>
                </div>
                <button onClick={() => {
                    push('/about')
                }}>About page
                </button>
            </header>
        </div>
    )
}
