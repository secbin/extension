import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import DirectionsIcon from '@mui/icons-material/Directions';
import {Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

import { makeStyles, createStyles } from '@mui/styles';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const useStyles = makeStyles(theme => ({
    icon: {
        fontSize: 80,
        width: '100%',
        color: 'green',
        margin: 20,
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
        margin: 15,
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        // backgroundColor: theme.palette.primary.light,
        // color: theme.palette.primary.contrastText,
        // boxShadow: "none",
        marginBottom: 14,
    },
    heading: {
        width: '400px',
    },
    blue: {
        color: 'cadetblue'
    },

}));


export default function Process() {
    const classes = useStyles();

    const historyItems = [
        {
            url: "pastebin.com/123123123",
            date: new Date(),
            passkey: "magic"
        },
        {
            url: "pastebin.com/5454323",
            date: new Date(),
            passkey: "magic"

        },
        {
            url: "pastebin.com/345223123",
            date: new Date(),
            passkey: "magic"

        },
        {
            url: "pastebin.com/6543123",
            date: new Date(),
            passkey: "magic"
        },
    ]

    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


    return (
        <>
        <div className={classes.center}>
            <CheckCircleIcon className={classes.icon}/>
            <Typography variant={'h2'}>Created Ciphertext</Typography>
            <Card className={classes.copybox}>
                <InputBase placeholder={"jaslkdj3ouroqejdnfskf"} value={'jaslkdykjhgjy97yhuhkhikuhkjhkjhkjj3ou'} />
                <IconButton>
                   <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>
        </div>
        </>

    );
}

