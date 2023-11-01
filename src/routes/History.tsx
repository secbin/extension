import React, {useContext } from "react";
import List from '@mui/material/List';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Action } from '../constants'
import moment from "moment";
import { AppContext, HistoryType } from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { printDateInCorrectFormat } from "../chrome/utils";
import clsx from "clsx";
import HistoryIcon from '@mui/icons-material/History';
import DateOrderedItem from "../components/DateOrderedItem";


const useStyles = makeStyles(theme => ({
    pageHeading: {
        paddingLeft: 20,
        paddingTop: 20,
        marginBottom: 10,
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
    let { push } = useHistory();
    const { state, dispatch } = useContext(AppContext);
    const { history } = state;

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

    const classes = useStyles();
    let lastLastDate = '';

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
                    <>
                        <Typography variant='h2' className={classes.pageHeading}>History</Typography>
                    </>
                )
            }
            <List className={classes.list} >
                {history?.reverse().map((item: any, index: number) => {
                    let showItem = false;
                    const itemTime = moment(item.date).format('MMMM D, YYYY');
                    if(itemTime !== lastLastDate) {
                        lastLastDate = itemTime;
                        showItem = true;
                    }
                    return (
                        <DateOrderedItem
                            showDateHeading={showItem}
                            clickHandler={handleHistory}
                            payload={item}
                            primary={item?.pastebinlink ? item.pastebinlink : `${item.key_length * 8} ${item.enc_mode} Encrypted Plaintext`}
                            secondary={printDateInCorrectFormat(item.date)}
                            date={item.date}
                        />
                )
                })}
        </List>
        </>
    );
}
