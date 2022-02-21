import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl, encryptText} from "../chrome/utils";
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
  <div>
  <p>Your Ciphertext: </p>
  <p>{ciphertext}</p>
  </div>
): <ErrorPage/>

)


}

// This function takes in the plaintext from the form
// encryptQuery is the Plaintext
//usePasteBinPost is the hook for posting to pasteBin
// PasteBinLink is the link returned from the post request.
function Plaintext({encryptQuery}:any){
  //
  const [pasteBinLink, error] = usePasteBinPost(encryptQuery);



  return(
    // <div>
    // <CiphertextItem ciphertext={pasteBinLink}/>
    // </div>
    <p></p>

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
function encryptSubmit(ciphertext:any){

    console.log("Encrypt Value: "+ ciphertext);
    setEncryptQuery(ciphertext);
}


    const encryptWrapper = () => {
        var result = encryptText(textbox, "password", "AES-GCM"); // password and Mode are optional

        setResponseFromContent(result.CipherTXT);
        encryptSubmit(result.CipherTXT);
    };

    var textbox = ""

    const textUpdate = (event: any) => {
        textbox = event.target.value;
    };



    return (
        <div className="App">
            <header className="App-header">
                <p>Home</p>
                <p>URL:</p>
                <p>
                    {url}
                </p>

                <form  onSubmit={(e) => {
                  e.preventDefault();
                    console.log(inputValue);
                    setQuery(inputValue);

                }}>
                  <input value={inputValue} placeholder="Enter The Paste Bin Key" onChange={e => setInputValue(e.target.value)} />
                  <button  type="submit">Decrypt</button>
                </form>

                <TextField id="outlined-basic" label="Text" variant="outlined" onChange={textUpdate}/>
                <Button variant="contained" onClick={encryptWrapper}>Encrypt</Button>

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
