import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, Divider, InputBase, Typography } from '@mui/material';
import { Action } from "../constants";
import { AppContext } from "../contexts/AppContext";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(theme => ({
    copybox: {
        paddingLeft: 10,
        paddingRight: 10,
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
    const { state, dispatch } = React.useContext(AppContext);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        dispatch({type: Action.UPDATE_SETTINGS, payload: {...state.settings, api_key: apiKey} })
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button onClick={handleClickOpen}>
                { props.APIKEY ? "Update" : "Set Key" }
            </Button>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle>
                    <Typography variant={'h3'}>Set Pastebin API Key</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography variant={'body2'}>
                            In order to be able to use the PasteBin API, you will need to
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
                <Divider/>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button variant='contained' disableElevation onClick={handleClose}>Set</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}