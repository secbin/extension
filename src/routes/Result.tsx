import React, { useEffect } from "react";
import { Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ErrorIcon from '@mui/icons-material/Error';
import { makeStyles, createStyles } from '@mui/styles';
import { AppContext, HistoryType } from "../AppContext";
import { getLocalItem, getSyncItem } from '../chrome/utils/storage';
import {Action, Storage } from '../constants'
import clsx from "clsx";
import { copyTextClipboard, printDateInCorrectFormat } from "../chrome/utils"
import { useHistory } from "react-router-dom";
import {ChevronLeft } from "@mui/icons-material";

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
        // margin: 15,
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
        width: 390,
    },
    copyboxLarge: {
        paddingLeft: 10,
        // margin: 15,
        borderRadius: 6,
        border: '1px solid #E0E0E0',
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
            //console.log("HISTORY from there", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
            setResult(state.history.pop() || data[Storage.HISTORY].pop());
        })
        //console.log("HISTORY state", history)
        // console.log("LAST ITEM", lastItem)
      //  console.log("HISTORY CONTEXT", historyContext);
        //console.log("LAST ITEM ITEM", history[history.length - 1]);

      //  console.log("SET RESULT", result);
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
                <ErrorIcon className={clsx(classes.icon, classes.red)} />
                <Typography variant={'h2'}>Error posting to Pastebin</Typography>
                </>
                ) : (
                <>
                <CheckCircleIcon className={clsx(classes.icon, classes.green)}/>
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
                        <Typography variant={'h4'}>Link</Typography>
                        <Card className={classes.copybox}>
                            <InputBase
                                className={classes.textArea}
                                placeholder={result?.pastebinlink}
                                value={result?.pastebinlink}
                            />
                            <IconButton onClick={() => copyTextClipboard(result?.pastebinlink)} >
                                <ContentPasteIcon color="primary"
                                />
                            </IconButton>
                        </Card>
                    </>)}

                <Typography variant={'h4'}>Key</Typography>
                <Card className={classes.copybox}>
                    <InputBase
                        className={classes.textArea}
                        placeholder={result.key}
                        value={result.key}
                    />
                    <IconButton onClick={() => copyTextClipboard(result?.key)} >
                       <ContentPasteIcon color="primary"/>
                    </IconButton>
                </Card>

                <Typography variant={'h4'}>Ciphertext</Typography>
                <Card className={classes.copyboxLarge}>
                    <InputBase
                        className={classes.textArea}
                        multiline
                        placeholder={result.enc_text}
                        value={result.enc_text}
                        rows={5}
                    />
                    <IconButton onClick={() => copyTextClipboard(result?.enc_text)} >
                        <ContentPasteIcon color="primary"/>
                    </IconButton>
                </Card>
                </div>
                    <Button className={classes.bottomButton} startIcon={<ChevronLeft />} onClick={() => { goBack()}}>Back</Button>
                </>
            ) : (
                <>
                    <ContentPasteIcon className={clsx(classes.icon, classes.grey)} />
                    <Typography variant={'h2'}>No Encryptions</Typography>
                </>
            )


            }
        </div>
    );
}
