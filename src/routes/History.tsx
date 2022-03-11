import React, { useContext, useEffect, useState } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {Button, Card, Divider, IconButton, Paper, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { makeStyles, createStyles } from '@mui/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { getCurrentTabUrl } from '../chrome/utils';
import { getItem, setItem } from '../chrome/utils/storage';
import { Storage } from '../constants'

const useStyles = makeStyles(theme => ({
    card: {
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
    },
    pageHeading: {
        paddingLeft: 20,
        paddingTop: 20,
        marginBottom: 10,
    },
    listItemText: {
        fontSize: 14,
    },
    list: {
        padding: 20,
    }
}));

const historyItems = [
    {
        url: "pastebin.com/123123123",
        date: JSON.stringify(new Date()),
        passkey: "magic"
    },
    {
        url: "pastebin.com/5454323",
        date: JSON.stringify(new Date()),
        passkey: "magic"

    },
    {
        url: "pastebin.com/345223123",
        date: JSON.stringify(new Date()),
        passkey: "magic"

    },
    {
        url: "pastebin.com/6543123",
        date: JSON.stringify(new Date()),
        passkey: "magic"
    },
]


export default function History() {
    useEffect(() => {
        // setItem(Storage.HISTORY, historyItems);

        getItem(Storage.HISTORY, (data) => {
            console.log("HISTORY", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
        })

    }, []);

    const [history, setHistory] = React.useState([]);

    const classes = useStyles();
    //TODO Add moment JS to calculate time
    return (
        <>
            {/*TODO Add moment to show times daily*/}
            <Typography variant='h2' className={classes.pageHeading}>History</Typography>
            <List className={classes.list} >
            {history?.map((item: any, index: number) => {
            return (
            <>
            {/*{<Typography variant={'h4'}>Today</Typography>}*/}
            <Card variant="outlined" classes={{root: classes.card}}>
                <ListItem key={item?.pastebinlink}>
                    <ListItemText primary={item?.pastebinlink ? item.pastebinlink : "Encrypted Plaintext"} secondary={item.date} />
                    <IconButton color="primary" aria-label="Unlock CipherText">
                      <LockOpenIcon />
                    </IconButton>
                </ListItem>
            </Card>

            </>
            )
            })}
        </List>
        </>
    );
}

