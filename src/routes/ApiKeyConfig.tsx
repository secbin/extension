import React, {useContext, useEffect, useLayoutEffect} from "react";
import {
    Box,
    Card,
    DialogContent,
    Divider,
    InputBase, ListItem, ListItemIcon, ListItemText,
    Typography
} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext, HistoryType} from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import {CheckCircle, ChevronLeft, ContentPasteRounded, Error} from "@mui/icons-material";
import {isValidDevKey} from "../chrome/utils/pastebin";
import {Action, DEFAULT_CONTEXT, PASTEBIN_API_KEY_LENGTH} from "../constants";
import moment from "moment";
import {copyTextClipboard} from "../chrome/utils";
import clsx from "clsx";
import goBack = chrome.tabs.goBack;

const useStyles = makeStyles(theme => ({
    center: {
        width: '100%',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',

    },
    left: {
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
    },
    bottomButton: {
        marginTop: 10,
        marginBottom: 15,
    },
    topMargin: {
        marginTop: 164,
    },
    copybox: {
        padding: '7px 0 7px 10px',
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14
    },
    margin: {
        marginTop: 10,
    },
    card: {
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
    },
    green: {
        color: 'green',
    },
    red: {
        color: 'red',
    },
    icon: {
        fontSize: "14px",
    },
    pageHeading: {
        paddingLeft: 20,
        paddingTop: 20,
        marginBottom: 10,
    },
}));

export type LHistoryType = {
    id: number,
    pastebinlink: string,
    enc_mode: string,
    key_length: number,
    key: string,
    enc_text: string,
    date: Date,
}

export function StatusBanner(props: any) {
    const classes = useStyles();

    return (
        // <Card classes={{ root: classes.card }}>
        <ListItem sx={{padding: 0, margin: 0, fontSize: 12, fontWeight: 500, minWidth: 0, width: 'auto'}}>
            <ListItemIcon sx={{minWidth: '18px'}}>
                {props.success ? (
                    <CheckCircle className={clsx(classes.green, classes.icon)}/>) : (
                    <Error className={clsx(classes.red, classes.icon)} />
                )}

            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: props.success ? 'green' : 'red', fontSize: '14px'}} primary={props.success ? "Verified by Pastebin" : "Rejected by Pastebin"}/>
        </ListItem>
        // </Card>
    )
}

export const checkDefaultApiKey = (apiKeyContext: string) => {
    if(apiKeyContext === atob(DEFAULT_CONTEXT.api_key)) {
        return "";
    }

    return apiKeyContext;
}

const EncryptionConfig = () => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const { state, dispatch } = React.useContext(AppContext);
    const { api_key, enc_mode, theme, key_length, encryption } = state.settings;
    const [apiKey, setApiKey] = React.useState(checkDefaultApiKey(api_key));
    const [valid, setValid] = React.useState<null | boolean>(null);
    const [timeoutId, setTimeoutId] = React.useState<any>(null);
    let { goBack } = useHistory();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleSave = () => {
        dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, api_key: apiKey} })
        // goBack();
    };

    const handleApiKeyTest = () => {
        isValidDevKey(apiKey).then((isValid) => {
            setValid(isValid)
            handleSave()
        })
    }




    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if(valid === true || valid === false) {
            setValid(null);
        }

        const id = setTimeout(() => {
            // Execute your command here
            if(apiKey.length === PASTEBIN_API_KEY_LENGTH) {
                handleApiKeyTest()
            }
        }, 200);

        setTimeoutId(id);

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(id);
    }, [apiKey]);

    useLayoutEffect(() => {
            dispatch({type: Action.SET_SUBHEADER,
                payload: {
                    subheader: {
                        back_button: true,
                        primary: "Pastebin API",
                        secondary: "Set API Key",
                        custom_button: null
                    }
                }
            })
    }, [state.app.location]);

    return (
        <Box>
            <DialogContent>
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant={'h4'}>API Key</Typography>
                    {valid === true && apiKey.length === PASTEBIN_API_KEY_LENGTH && (
                        <StatusBanner success={true}/>
                    )}
                    {valid === false && apiKey.length === PASTEBIN_API_KEY_LENGTH && (
                        <StatusBanner success={false}/>
                    )}
                </Box>
                <Card className={classes.copybox}>
                    <InputBase
                        autoFocus
                        defaultValue={api_key !== atob(DEFAULT_CONTEXT.api_key) ? api_key : ""}
                        placeholder={"5b6d1b053d850e4c095ff6707ba816fc"}
                        fullWidth
                        sx={{fontFamily: 'Menlo, monospace', fontSize: 16, letterSpacing: '-0.1px', fontWeight: 700}}
                        onChange={(event) => {
                            setApiKey(event.target.value)
                        }}
                    />
                </Card>
            </DialogContent>
            <Divider/>
            <DialogContent sx={{height: '200px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', willChange: 'scroll-position', scrollBehavior: 'smooth', transform: 'translateZ(0)'}}>
                <Typography variant={'h3'}>Get Started with PasteBin API</Typography>
                <br/>
                <Typography variant={'h4'}>Sign Up for a Pastebin Account</Typography>
                <Typography variant={'body2'}>
                    To use the PasteBin API, you first need an account. Sign up <a href="https://pastebin.com/signup"
                       onClick={() => window.open("https://pastebin.com/signup")}>here</a>.
                </Typography>

                {/*<br/>*/}
                <Typography variant={'h4'}>Access Your API Key</Typography>
                <Typography variant={'body2'} className={classes.margin}>
                    Once you have an account, your API key can be found in the API documentation section. Access it <a href="https://pastebin.com/doc_api"
                                                onClick={() => window.open("https://pastebin.com/doc_api")}>here</a>
                </Typography>
            </DialogContent>
        </Box>
    );
}

export default EncryptionConfig;