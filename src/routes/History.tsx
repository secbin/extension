import React, { useEffect } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {Card, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { getLocalItem, getSyncItem } from '../chrome/utils/storage';
import { Storage } from '../constants'
import moment from "moment";

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

const now = new Date().getTime();
const printDateInCorrectFormat = (dateOfEvent: number) => {
    let eventDate = new Date(dateOfEvent).getTime();
    if(Math.abs(now - eventDate ) < 170000000) {
        return moment(dateOfEvent).fromNow();
    } else {
        return moment(dateOfEvent).format('MMMM D, YYYY');
    }
}

export default function History() {
    useEffect(() => {

        getLocalItem(Storage.HISTORY, (data) => {
            console.log("HISTORY", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
        })

    }, []);

    const [history, setHistory] = React.useState([]);
    const classes = useStyles();
    let lastLastDate = 0;
    //TODO Add moment JS to calculate time
    return (
        <>
            {/*TODO Add moment to show times daily*/}
            <Typography variant='h2' className={classes.pageHeading}>History</Typography>
            <List className={classes.list} >
            {history?.reverse().map((item: any, index: number) => {
                let showitem = false;
                if(item.date - lastLastDate > 43200) {
                    lastLastDate = item.date;
                    showitem = true;
                }
                return (
            <>
            {showitem && (<Typography variant='h4'>{printDateInCorrectFormat(item.date)}</Typography>)}
            {/*{<Typography variant={'h4'}>Today</Typography>}*/}
            <Card variant="outlined" classes={{root: classes.card}}>
                <ListItem key={item?.pastebinlink}>
                    <ListItemText primary={item?.pastebinlink ? item.pastebinlink : "Encrypted Plaintext"} secondary={printDateInCorrectFormat(item.date)} />
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

