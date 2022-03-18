import React, { useEffect } from "react";
import clsx from "clsx";
import { Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import { makeStyles, createStyles } from "@mui/styles";
import { AppContext, HistoryType } from "../AppContext";
import { getLocalItem, getSyncItem } from "../chrome/utils/storage";
import { Action, Storage } from "../constants"
import { copyTextClipboard, printDateInCorrectFormat } from "../chrome/utils"
import { useHistory } from "react-router-dom";
import { ChevronLeft, ContentPaste, CheckCircle, Error } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
    icon: {
        fontSize: 80,
        width: '100%',
        color: 'green',
        margin: 20,
    },
    green: {
        color: 'green',
    },
    red: {
        color: 'red',
    },
    center: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
    },
    copybox: {
        paddingLeft: 10,
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
        width: 390,
    },
    copyboxLarge: {
        paddingLeft: 10,
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
        width: 390,
    },
    heading: {
        width: '400px',
    },
    blue: {
        color: 'cadetblue'
    },
    grey: {
        color: 'grey',
    },
    left: {
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
    },
    textArea: {
        width: 350,
    },
    bottomButton: {
        marginTop: 10,
        marginBottom: 15,
    },
    buttonMarginBottom: {
        marginBottom: 20,
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

export default function Result(props: any) {
    useEffect(() => {
        getLocalItem(Storage.HISTORY, (data) => {
            setHistory(data[Storage.HISTORY]);
            setResult(state.history.pop() || data[Storage.HISTORY].pop());
        })
        return function cleanup () {
            dispatch({type: Action.CLEAR_HISTORY});
        }
    }, [])

    let {push, goBack} = useHistory();
    const { state, dispatch } = React.useContext(AppContext);
    const classes = useStyles();
    const historyContext = state.history;
    const [history, setHistory] = React.useState<LHistoryType[]>([]);
    const [result, setResult] = React.useState<any>();

    return (
        <div className={classes.center}>
            {result ? (
                <>
                {result?.pastebinlink && result?.pastebinlink.includes("Error") ? (
                <>
                <Error className={clsx(classes.icon, classes.red)} />
                <Typography variant={'h2'}>Error posting to Pastebin</Typography>
                </>
                ) : (
                <>
                <CheckCircle className={clsx(classes.icon, classes.green)}/>
                    {result?.pastebinlink && result?.pastebinlink.length ?
                <Typography variant={'h2'}>Posted to Pastebin</Typography> :
                <Typography variant={'h2'}>Encrypted Ciphertext</Typography>
                }
                <Typography variant={'h4'}>{printDateInCorrectFormat(result.date)} with {result.key_length * 8} {result.enc_mode}</Typography>
                </>
                )}
                <div className={classes.left}>

                {result?.pastebinlink && !result?.pastebinlink.includes("Error") && (
                    <>
                        <Typography variant={'h4'}>Pastebin Link</Typography>
                        <Card className={classes.copybox}>
                            <InputBase
                                className={classes.textArea}
                                placeholder={result?.pastebinlink}
                                value={result?.pastebinlink}
                            />
                            <IconButton onClick={() => copyTextClipboard(result?.pastebinlink)} disableRipple>
                                <ContentPaste color="primary"
                                />
                            </IconButton>
                        </Card>
                    </>)}

                <Typography variant={'h4'}>Passkey</Typography>
                <Card className={classes.copybox}>
                    <InputBase
                        className={classes.textArea}
                        placeholder={result.key}
                        value={result.key}
                    />
                    <IconButton onClick={() => copyTextClipboard(result?.key)} disableRipple>
                       <ContentPaste color="primary"/>
                    </IconButton>
                </Card>

                <Typography variant={'h4'}>Ciphertext</Typography>
                <Card className={classes.copyboxLarge}>
                    <InputBase
                        className={classes.textArea}
                        placeholder={result.enc_text}
                        value={result.enc_text}
                    />
                    <IconButton onClick={() => copyTextClipboard(result?.enc_text)} disableRipple>
                        <ContentPaste color="primary"/>
                    </IconButton>
                </Card>
                </div>
                    <Button className={classes.bottomButton} startIcon={<ChevronLeft />} onClick={() => { goBack()}}>Back</Button>
                </>
            ) : (
                <>
                    <ContentPaste className={clsx(classes.icon, classes.grey)} />
                    <Typography variant={'h2'}>No Encryptions</Typography>
                </>
            )

            }
        </div>
    );
}
