import React from "react";
import { useEffect } from "react";
import { Button} from '@mui/material';
import { makeStyles } from "@mui/styles";
import {AppContext, HistoryType} from "../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { ChevronLeft} from "@mui/icons-material";
import StatusIcon from "../components/StatusIcon";
import Copybox from "../components/Copybox";

const useStyles = makeStyles(theme => ({
    center: {
        width: '100%',
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
    const { state } = React.useContext(AppContext);

    useEffect(() => {
        setResult(state.history.length ? state.history[state.history.length - 1] : null);
    }, [])

    let { goBack } = useHistory();
    const classes = useStyles();

    const [result, setResult] = React.useState<HistoryType | null>();

    return (
        <div className={classes.center}>
            {result ? (
                <>
                {result?.pastebinlink && result?.pastebinlink.includes("Error") ? (
                    <StatusIcon result={result} variant={'error'}/>
                ) : (
                    <StatusIcon result={result} variant={'success'} />
                )}
                <div className={classes.left}>

                {result?.pastebinlink && !result?.pastebinlink.includes("Error") && (
                    <Copybox value={result?.pastebinlink} title={'Pastebin Link'} />
                )}

                    <Copybox value={result.key} title={'Passkey'} />
                    <Copybox value={result.enc_text} title={'Ciphertext'} />

                </div>
                    <Button className={classes.bottomButton} startIcon={<ChevronLeft />} onClick={() => { goBack()}}>Back</Button>
                </>
            ) : (
                <StatusIcon variant={'empty'} />
            )
            }
        </div>
    );
}

export default Result;