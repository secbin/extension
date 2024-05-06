import React, {useContext } from "react";
import List from '@mui/material/List';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Action } from '../constants'
import moment from "moment";
import { AppContext, HistoryType } from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { printDateInCorrectFormat } from "../chrome/utils";
import DateOrderedItem from "../components/common/DateOrderedItem";
import StatusIcon from "../components/editor/StatusIcon";


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
    }
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

const handleTitle = (item: HistoryType) => {
    let title = "";

    if(item?.pastebinlink) {
        return item.pastebinlink;
    } else {
        if(!!item?.key_length && !!item.enc_mode) {
            return `${item.key_length * 8} ${item.enc_mode} Encrypted Draft`
        } else {
            return "Draft"
        }
    }
}
    
    const classes = useStyles();
    let lastLastDate = '';

    return (
        <>
            {/* @ts-ignore */}
            {history && history?.length ? (
                    <Typography variant='h2' className={classes.pageHeading}>History</Typography>
            ) :
                (
                    <>
                        <div className={classes.center}>
                            <StatusIcon variant={'empty-history'} />
                        </div>
                    </>
                )
            }
            <List className={classes.list} >
                {history?.slice().reverse().map((item: any, index: number) => {
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
                            primary={handleTitle(item)}
                            secondary={printDateInCorrectFormat(item.date)}
                            date={item.date}
                        />
                )
                })}
        </List>
        </>
    );
}
