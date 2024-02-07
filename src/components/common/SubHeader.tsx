import React, {Fragment, useContext, useEffect} from "react";
import { Card, Divider, IconButton, InputBase, ListItem, ListItemText, Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import {copyTextClipboard} from "../../chrome/utils"
import {ChevronLeft, ContentPaste } from "@mui/icons-material";
import {useHistory, useLocation} from "react-router-dom";
import {AppContext} from "../../contexts/AppContext";

const useStyles = makeStyles(theme => ({
    copybox: {
        // paddingLeft: 10,
        borderBottom: '1px solid rgba(170,170,170,0.25)',
        // borderColor: 'rgba(170,170,170,0.25)',
        boxShadow: '0 0 7px 0 rgba(0,0,0,0.02)',
        marginBottom: 14,
        width: 390,
    },
    subHeader: {
        // paddingLeft: 10,
        borderRadius: 0,
        borderBottom: '1px solid rgba(170,170,170,0.25)',
        boxShadow: '0 0 20px 0 rgba(0,0,0,0.07)',
        width: '100vw'
    },
}));

export type LCopyboxType = {
    title?: string,
    value?: string,

}

const SubHeader = () => {
    const { state, dispatch } = useContext(AppContext);
    const { subheader } = state.app;
    const location = useLocation();

    console.log("SUBHEADER IN COMPONENT HERE", {subheader});

    const classes = useStyles();
    let { goBack } = useHistory();
    //
    // useEffect(() => {
    //     // Rerender
    // }, [location])

    if (subheader) {
        return (
            <>
                <Card className={classes.subHeader}>
                    <ListItem sx={{padding: '8px 6px'}}>
                        {subheader?.back_button && (
                            <Fragment>
                                <IconButton sx={{borderRadius: '4px'}} onClick={() => {
                                    goBack()
                                }}>
                                    <ChevronLeft color="secondary"/>
                                </IconButton>
                                <Divider sx={{margin: '0 6px'}} orientation="vertical" flexItem/>
                            </Fragment>
                        )}
                        {(subheader?.primary || subheader?.secondary) && (
                            <ListItemText sx={{textAlign: 'center', marginLeft: '-50px'}} primary={subheader?.primary}
                                          secondary={subheader?.secondary}/>
                        )}
                    </ListItem>

                </Card>
            </>
        )
    }

    return null;
}

export default SubHeader;
