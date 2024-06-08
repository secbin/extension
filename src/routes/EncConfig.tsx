import React, {useContext, useEffect, useLayoutEffect} from "react";
import {
    Box,
    Button,
    Card, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider,
    InputBase, ListItem, ListItemIcon, ListItemText, MenuItem, Select,
    Typography
} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext, HistoryType} from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import {CheckCircle, ChevronLeft, ContentPasteRounded, Error} from "@mui/icons-material";
import StatusIcon from "../components/editor/StatusIcon";
import Copybox from "../components/common/Copybox";
import SubHeader from "../components/common/SubHeader";
import CopyboxMultiline from "../components/common/CopyboxMultiline";
import {isValidDevKey} from "../chrome/utils/pastebin";
import {Action, ENCRYPTION_METHODS, KEY_LENGTHS, PASTEBIN_API_KEY_LENGTH} from "../constants";
import moment from "moment";
import {copyTextClipboard} from "../chrome/utils";
import clsx from "clsx";
import goBack = chrome.tabs.goBack;
import SettingsItem from "../components/SettingsItem";

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
    menuItem: {
        height: 10,
        boxShadow: "none"
    },
    select: {
        height: 32,
        marginBottom: 8,
        marginTop: 8,
    }
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

const EncConfig = () => {
    const classes = useStyles();
    const { state, dispatch } = React.useContext(AppContext);
    const {enc_mode, key_length, encryption } = state.settings;

    // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
    const keyLengthHandler = (e: any) => {
        dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, key_length: e.target.value} })
    }

    const encModeHandler = (e: any) => {
        dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, enc_mode: e.target.value, } })
    }

    const encryptionHandler = (e: any) => {
        const newEncryption = {
            ...state.settings,
            encryption: encryption ? false : true,
        }
        dispatch({type: Action.UPDATE_SETTINGS, payload: newEncryption});

        console.log('UPDATING ENCRYPTION', {encryption, newEncryption})

    }

    useLayoutEffect(() => {
            dispatch({type: Action.SET_SUBHEADER,
                payload: {
                    subheader: {
                        back_button: true,
                        primary: "Encryption",
                        secondary: "Enable or customize features",
                        custom_button: null
                    }
                }
            })
    }, [state.app.location]);

    return (
        <Box>
            <DialogContent sx={{overflowY: 'auto', WebkitOverflowScrolling: 'touch', willChange: 'scroll-position', scrollBehavior: 'smooth', transform: 'translateZ(0)'}}>
                <Typography variant={'h4'}>Encryption</Typography>
                <SettingsItem
                    multilineSecondaryText={true}
                    primary={'Encryption Features'}
                    children={<Checkbox checked={encryption} onChange={encryptionHandler} />}
                />
                <Typography variant={'body2'}>
                    SecureBin can be used to safely encrypt text before its posted on Pastebin.org.
                </Typography>
                <br />
                <Typography variant={'h4'}>Advanced</Typography>
                <SettingsItem
                    primary={'Encryption Algorithm'}
                    children={(
                        <Select
                            className={classes.select}
                            value={enc_mode}
                            disabled={!encryption}
                            onChange={encModeHandler}
                        >
                            {ENCRYPTION_METHODS.map((item) => (
                                <MenuItem classes={{ root: classes.menuItem }}
                                          key={item.value}
                                          value={item.value}>{item.name}
                                </MenuItem>
                            ))}
                        </Select>)}
                />

                <SettingsItem
                    primary={'Key Length'}
                    children={(
                        <Select
                            // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
                            className={classes.select}
                            value={key_length}
                            onChange={keyLengthHandler}
                            disabled={!encryption}
                        >
                            {KEY_LENGTHS.map((item) => (
                                <MenuItem className={classes.menuItem}
                                          key={item.value}
                                          value={item.value}>{item.name}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
            </DialogContent>
        </Box>
    );
}

export default EncConfig;