import React from "react";
import { useEffect } from "react";
import { Button} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext, HistoryType} from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { ChevronLeft} from "@mui/icons-material";
import StatusIcon from "../components/editor/StatusIcon";
import Copybox from "../components/common/Copybox";
import SubHeader from "../components/common/SubHeader";
import CopyboxMultiline from "../components/common/CopyboxMultiline";
import {Action} from "../constants";
import moment from "moment/moment";

const useStyles = makeStyles(theme => ({
    center: {
        width: '100%',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',

    },
    left: {
        textAlign: 'left',
        marginLeft: 10,
        marginRight: 10,
    },
    bottomButton: {
        marginTop: 10,
        marginBottom: 15,
    },
    topMargin: {
        marginTop: 164,
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

const Result = () => {
    const { state, dispatch } = React.useContext(AppContext);
    const [result, setResult] = React.useState<HistoryType | null>();

    useEffect(() => {
        setResult(state.history.length ? state.history[state.history.length - 1] : null);

        // dispatch({type: Action.SET_SUBHEADER,
        //     payload: {
        //         subheader: {
        //             back_button: true,
        //             primary: result?.pastebinlink || null,
        //             secondary: result?.date ? moment(result.date).format('MMMM D, YYYY') : null,
        //             custom_button: null
        //         }
        //     }
        // })

    }, [])

    useEffect(() => {
        dispatch({type: Action.SET_SUBHEADER,
            payload: {
                subheader: {
                    back_button: true,
                    primary: result?.pastebinlink || null,
                    secondary: result?.date ? moment(result.date).format('MMMM D, YYYY') : null,
                    custom_button: null
                }
            }
        })

    }, [result])

    let { goBack } = useHistory();
    const classes = useStyles();


    const isPasteBin = !!result?.pastebinlink;
    const hasError = result?.pastebinlink.includes("PasteBin Error");
    const errorMessage = result?.pastebinlink.replace('PasteBin Error', '');

    return (
        <div className={classes.center}>
            {result ? (
                <>
                {isPasteBin && !hasError ? (
                    <StatusIcon result={result} variant={'success'}/>
                ) : (
                    null //<StatusIcon result={result} variant={'success'} />
                )}
                <div className={classes.left}>

                    {result?.pastebinlink && !result?.pastebinlink.includes("PasteBin Error") && (
                    <Copybox value={result?.pastebinlink} title={'Pastebin Link'} />
                )}
                {isPasteBin && hasError && errorMessage && (
                        <Copybox value={errorMessage} title={'PasteBin Error'} allowCopy={false} />
                )}
                    {result.enc_text && (<CopyboxMultiline value={result.enc_text} title={'Ciphertext'} />)}
                    {result.key && (<Copybox value={result.key} title={'Passkey'} type={'password'} allowCopy={true} toggleVisibility={true} />)}

                </div>
                </>
            ) : (
                <StatusIcon variant={'empty-clipboard'} />
            )
            }
        </div>
    );
}

export default Result;