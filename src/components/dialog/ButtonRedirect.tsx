import * as React from 'react';
import {
    Button, IconButton,
} from '@mui/material';

import {useHistory} from "react-router-dom";
import {ChevronRight} from "@mui/icons-material";

export default function ButtonRedirect(props: any) {
    let { push } = useHistory();

    const handleClickOpen = () => {
        if(props.external) {
            window.open("https://pastebin.com/signup");

        } else {
            push(props.url);
        }
    };

    return (
        <div>
            {props.external ? (
                <IconButton onClick={handleClickOpen}>
                    <ChevronRight />
                </IconButton>
            ) : (
                <Button onClick={handleClickOpen}>
                    {props.value}
                </Button>
            )}

        </div>
    );
}
