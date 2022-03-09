import * as React from 'react';
import { Button, Card, Divider, IconButton, InputAdornment, InputBase, Paper, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { makeStyles, createStyles } from '@mui/styles';

var text = ""
var key = ""

export function setResults(text: string, key:string){
    text = text
    key = key
}

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
        marginBottom: 14,
    },
    heading: {
        width: '400px',
    },
    blue: {
        color: 'cadetblue'
    },

}));


export default function Result() {
    const classes = useStyles();
    const [history, setHistory] = React.useState([]);

    return (
        <div className={classes.center}>
            <CheckCircleIcon className={classes.icon}/>
            <Typography variant={'h2'}>Created Ciphertext</Typography>
            <Card className={classes.copybox}>
                <p>Key: </p>
                <InputBase placeholder={key} value={key} />
                <IconButton>
                   <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>
            <Card className={classes.copybox}>
                <p>Cipher Text: </p>
                <InputBase placeholder={text} value={text} />
                <IconButton>
                   <ContentPasteIcon color="primary"/>
                </IconButton>
            </Card>
        </div>
    );
}
