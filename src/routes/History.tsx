import React, {useContext, useEffect } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Card, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { getLocalItem, getSyncItem } from '../chrome/utils/storage';
import { Action, Storage } from '../constants'
import moment from "moment";
import { AppContext, HistoryType } from "../AppContext";
import { useHistory } from "react-router-dom";
import { printDateInCorrectFormat } from "../chrome/utils";
import clsx from "clsx";
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


const useStyles = makeStyles(theme => ({
    card: {
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
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
    },
    icon: {
        fontSize: 80,
        width: '100%',
        color: 'green',
        margin: 20,
    },
    grey: {
        color: 'grey',
    },
    center: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
    },

}));


export default function History() {
    let { push, goBack } = useHistory();
    const { state, dispatch } = useContext(AppContext);

    useEffect(() => {

        getLocalItem(Storage.HISTORY, (data) => {
            //console.log("HISTORY", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
        })

    }, []);

    const handleHistory = (item: HistoryType) => {
        dispatch({type: Action.ADD_TO_HISTORY, payload: {
                id: item.id,
                pastebinlink: item.pastebinlink,
                enc_mode: item.enc_mode,
                key_length: item.key_length,
                key: item.key,
                enc_text: item.enc_text,
                date: item.date,
            }
        })

        push('/result');
    }

    const [history, setHistory] = React.useState([]);
    const classes = useStyles();
    let lastLastDate = 0;
    //TODO Add moment JS to calculate time

    return (
        <>
            {/* @ts-ignore */}
            {!history && !history?.length ? (
                <div className={classes.center}>
                    <HistoryIcon className={clsx(classes.icon, classes.grey)} />
                    <Typography variant={'h2'}>No History</Typography>
                </div>
            ) :
                (
                    <Typography variant='h2' className={classes.pageHeading}>History</Typography>
                )
            }
            <List className={classes.list} >
            {history?.reverse().map((item: any, index: number) => {
                let showitem = false;
                if(item.date - lastLastDate > 43200) {
                    lastLastDate = item.date;
                    showitem = true;
                }
                return (
            <>
            {showitem && (<Typography variant='h4'>{moment(item.date).format('MMMM D, YYYY')}</Typography>)}
            {/*{<Typography variant={'h4'}>Today</Typography>}*/}
            <Card classes={{root: classes.card}}>
                <ListItem key={item?.pastebinlink}>
                    <ListItemText primary={item?.pastebinlink ? item.pastebinlink : `${item.key_length * 8} ${item.enc_mode} Encrypted Plaintext`} secondary={printDateInCorrectFormat(item.date)} />
                    <IconButton color="primary" aria-label="Unlock CipherText" onClick={(e) => handleHistory(item)}>
                      <InfoOutlinedIcon />
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
