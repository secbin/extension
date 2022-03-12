import React, { useEffect } from "react";
import { Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ErrorIcon from '@mui/icons-material/Error';
import { makeStyles, createStyles } from '@mui/styles';
import { AppContext, HistoryType } from "../AppContext";
import { getItem } from '../chrome/utils/storage';
import { Storage } from '../constants'
import clsx from "clsx";
import { copyTextClipboard } from "../chrome/utils"

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
    left: {
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
    },
    textArea: {
        width: 350,
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
        getItem(Storage.HISTORY, (data) => {
            console.log("HISTORY from there", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
        })
    }, []);

    const { state, dispatch } = React.useContext(AppContext);
    const classes = useStyles();
    const key = state.draft.key;
    const link = state.draft.pastebinlink;
    const ctxt = state.draft.ciphertext;
    const [history, setHistory] = React.useState<LHistoryType[]>([]);
    const lastItem = history[history.length - 1]

    console.log("HISTORY state", history)
    console.log("LAST ITEM", lastItem)

    return (
        <div className={classes.center}>
            {lastItem && (
                <>
                    {lastItem.pastebinlink.includes("Error") ? (
                <>
                <ErrorIcon className={clsx(classes.icon, classes.red)} />
                <Typography variant={'h2'}>Error posting to Pastebin</Typography>
                </>
                ) : (
                <>
                <CheckCircleIcon className={clsx(classes.icon, classes.green)}/>
                <Typography variant={'h2'}>Posted to Pastebin</Typography>
                </>
                )}

                <div className={classes.left}>

                {lastItem?.pastebinlink && !lastItem?.pastebinlink.includes("Error") && (
                    <>
                        <Typography variant={'h4'}>Link</Typography>
                        <Card className={classes.copybox}>
                            <InputBase
                                className={classes.textArea}
                                placeholder={lastItem?.pastebinlink}
                                value={lastItem?.pastebinlink}
                            />
                            <IconButton onClick={() => copyTextClipboard(lastItem?.pastebinlink)} >
                                <ContentPasteIcon color="primary"
                                />
                            </IconButton>
                        </Card>
                    </>)}

                <Typography variant={'h4'}>Key</Typography>
                <Card className={classes.copybox}>
                    <InputBase
                        className={classes.textArea}
                        placeholder={lastItem.key}
                        value={lastItem.key}
                    />
                    <IconButton onClick={() => copyTextClipboard(lastItem?.key)} >
                       <ContentPasteIcon color="primary"/>
                    </IconButton>
                </Card>

                <Typography variant={'h4'}>Ciphertext</Typography>
                <Card className={classes.copyboxLarge}>
                    <InputBase
                        className={classes.textArea}
                        multiline
                        placeholder={lastItem.enc_text}
                        value={lastItem.enc_text}
                        rows={5}
                    />
                    <IconButton onClick={() => copyTextClipboard(lastItem?.enc_text)} >
                        <ContentPasteIcon color="primary"/>
                    </IconButton>
                </Card>
                </div>
                </>
            )}
        </div>
    );
}

