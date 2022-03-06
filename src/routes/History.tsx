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
import {Button, Card, Divider, IconButton, Paper, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { makeStyles, createStyles } from '@mui/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const useStyles = makeStyles(theme => ({
    card: {
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        // backgroundColor: theme.palette.primary.light,
        // color: theme.palette.primary.contrastText,
        // boxShadow: "none",
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

export default function History() {

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

    const classes = useStyles();
    //TODO Add moment JS to calculate time
    return (
        <>
        {/*<p style={{textAlign: 'left'}}>History</p>*/}
            <Typography variant='h2' className={classes.pageHeading}>History</Typography>
            <List className={classes.list} >
            {historyItems.map((item) => {
            return (
            <>
            <Typography variant={'h4'}>Today</Typography>
            <Card variant="outlined" classes={{root: classes.card}}>
                <ListItem key={item.url}>
                    <ListItemText primary={item.url} secondary={item.date.toLocaleString('en-US')} />
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

