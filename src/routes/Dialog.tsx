import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {setSyncItem, getSyncItem} from "../chrome/utils/storage";
import { Storage } from "../constants";
import {Card, Divider, InputBase, Typography } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';


const useStyles = makeStyles(theme => ({
    copybox: {
        paddingLeft: 10,
        paddingRight: 10,
        // margin: 15,
        borderRadius: 6,
        border: '1px solid',
        borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
        marginTop: 20,
        marginBottom: 14,
    },
    margin: {
        marginTop: 10,
    }


}));

export default function FormDialog(props: any) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [apiKey, setApiKey] = React.useState("");
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {

        //console.log("Setting the API KEY:",apiKey);
        setSyncItem(Storage.API_KEY,apiKey);
        setOpen(false);
        getSyncItem(Storage.API_KEY, (data: any) => {
            //console.log(KEY_LENGTH)
          })
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button onClick={handleClickOpen}>
                { props.APIKEY ? "Change Key" : "Set Key" }
            </Button>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle>
                    <Typography variant={'h3'}>Set Pastebin Api Key</Typography>
                </DialogTitle>
                <Divider/>
                <DialogContent>
                    <DialogContentText>
                        <Typography variant={'body2'}>
                        In order to be able to use the PasteBin Api, you will need to
                        create an account with PasteBin in order to get an Api key.
                        </Typography>
                        <Typography variant={'body2'} className={classes.margin}>
                        Once you have made an account enter in the key here and you are all good to go!
                        </Typography>
                    </DialogContentText>
                    <Card className={classes.copybox}>
                    <InputBase
                        autoFocus
                        defaultValue={props.APIKEY}
                        placeholder={"API Key"}
                        fullWidth
                        onChange={(event) => {setApiKey(event.target.value)}}
                    />
                    </Card>
                    <DialogContentText>
                        <Typography variant={'body2'} className={classes.margin}>
                            You can signup for an API key <a href="https://pastebin.com/doc_api" onClick={()=> window.open("https://pastebin.com/doc_api")}>here</a>
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleClose}>Set</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
