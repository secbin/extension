import * as React from 'react';
import { Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { makeStyles, createStyles } from '@mui/styles';
import { AppContext } from "../AppContext";

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
        // margin: 15,
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
        width: 400,
    },
    copyboxLarge: {
        paddingLeft: 10,
        // margin: 15,
        borderRadius: 6,
        border: '1px solid #E0E0E0',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginBottom: 14,
        width: 400,

    },
    heading: {
        width: '400px',
    },
    blue: {
        color: 'cadetblue'
    },
    left: {
        textAlign: 'left',
    }

}));


export default function Result(props: any) {
    const { state, dispatch } = React.useContext(AppContext);
    const classes = useStyles();
    const key = state.draft.key;
    const link = state.draft.pastebinlink;
    const ctxt = state.draft.ciphertext;

    return (
        <div className={classes.center}>
            <CheckCircleIcon className={classes.icon}/>
            <Typography variant={'h2'}>Created Ciphertext</Typography>

            <div className={classes.left}>
            <Typography variant={'h4'}>Key</Typography>
            <Card className={classes.copybox}>
                <InputBase placeholder={key} value={key} />
                <IconButton>
                   <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>

            <Typography variant={'h4'}>Link</Typography>
            <Card className={classes.copybox}>
                <InputBase placeholder={link} value={link} />
                <IconButton>
                   <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>

            <Typography variant={'h4'}>Ciphertext</Typography>
            <Card className={classes.copyboxLarge}>
                <InputBase
                    multiline
                    placeholder={ctxt}
                    value={ctxt}
                    rows={5}
                />
                <IconButton>
                    <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>
            </div>
        </div>
    );
}

