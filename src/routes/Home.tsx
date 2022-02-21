import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl, encryptText} from "../chrome/utils";
import { Button, TextField } from "@mui/material";

export const Home = () => {
    const [url, setUrl] = useState<string>('');
    const [responseFromContent, setResponseFromContent] = useState<string>('');

    let { push } = useHistory();

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

    const encryptWrapper = () => {
        var result = encryptText(textbox, "password", "AES-GCM"); // password and Mode are optional

        setResponseFromContent(result.CipherTXT);
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
                <TextField id="outlined-basic" label="Text" variant="outlined" onChange={textUpdate}/>
                <Button variant="contained" onClick={encryptWrapper}>Encrypt</Button>
                <button onClick={sendTestMessage}>SEND MESSAGE</button>
                <button onClick={sendRemoveMessage}>Remove logo</button>
                <p>Response from content:</p>
                <p>
                    {responseFromContent}
                </p>
                <button onClick={() => {
                    push('/about')
                }}>About page
                </button>
            </header>
        </div>
    )
}
