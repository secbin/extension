import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";
import { Button, TextField } from "@mui/material";
import forge from 'node-forge';

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

    // https://www.cryptoexamples.com/javascript_forge_string_encryption_password_based_symmetric.html
    const encryptText = () => {
        // the password used for derviation of a key, assign your password here
        // if none is assigned a random one is generated
        let password = null;
        if (password === null) {
        password = forge.random.getBytesSync(48).toString();
        }

        // derive key with password and salt
        // keylength adheres to the "ECRYPT-CSA Recommendations" on "www.keylength.com"
        let salt = forge.random.getBytesSync(128);
        let key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);

        //create random initialization vector
        let iv = forge.random.getBytesSync(16);

        // ENCRYPT the text
        let cipher = forge.cipher.createCipher("AES-GCM", key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(textbox));
        cipher.finish();
        let tag = cipher.mode.tag;
        let encrypted = forge.util.encode64(cipher.output.data);


        setResponseFromContent(encrypted);
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
                <Button variant="contained" onClick={encryptText}>Encrypt</Button>
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
