import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {setItem} from "../chrome/utils/storage";
import { Storage } from "../constants";

export default function FormDialog(props: any) {
    const [open, setOpen] = React.useState(false);
    const [apiKey, setApiKey] = React.useState("");
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {

        console.log("Setting the API KEY:",apiKey);
        setItem(Storage.API_KEY,apiKey);
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen}>
                Set PasteBin Api Key
            </Button>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle>Set PasteBin Api Key</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        In order to be able to use the PasteBin Api, you will need to
                        create an account with PasteBin in order to get an Api key. Once
                        you have made an account enter in the key here and you are all good to go!
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="PasteBin API Key"
                        type="email"
                        fullWidth
                        variant="standard"
                        onChange={(event) => {setApiKey(event.target.value)}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Set Api Key</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
