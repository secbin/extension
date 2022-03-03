import React, {useReducer, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { About } from "./routes/About";
import { Home } from "./routes/Home";
import { NewHome } from "./routes/NewHome";
import SettingsIcon from '@mui/icons-material/Settings';
import { Settings } from './routes/Settings'
import { useHistory } from "react-router-dom";


// import usePasteBinSearch from './hooks/usePasteBinSearch';
import './App.css';
import {AppBar, Divider, IconButton, Toolbar, Typography } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';

import { ChevronLeft } from '@mui/icons-material';
import History from "./routes/History";
import HistoryIcon from '@mui/icons-material/History';
import { ConfigContext } from './ConfigContext';
import { defaultSettings } from './constants'
import logoimg from '../assets/img/securebinlogo.svg'
function reducer(state: any, action: any) {
    switch(action.type) {
        case "add":
            return action.payload;
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        boxShadow: "none",
        backgroundColor: "#fff"
    }
}));


export const App = () => {

    const [appConfig, setAppConfig] = useState({})
    const [securebin, dispatch] = useReducer(reducer, defaultSettings);
    let {push, goBack} = useHistory();
    const classes = useStyles();

    return (
        // <ConfigContext.Provider>
            <>
                <div>
                <AppBar className={classes.root} position="static" enableColorOnDark>

                    <Toolbar >
                        <img src="/securebinlogo.svg" alt="Kitten" />
                        <div style={{marginLeft: 'auto'}}>
                        {/*<IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { goBack()}}>*/}
                        {/*    <ChevronLeft />*/}
                        {/*</IconButton>*/}
                        {/*<Typography variant="h6" color="inherit" component="div">*/}
                        {/*    SecureBin*/}
                        {/*</Typography>*/}
                        <IconButton edge="end" aria-label="menu" sx={{ mr: 2 }} onClick={() => { push('/settings')}}>
                            <SettingsIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="menu" sx={{ mr: 2 }} onClick={() => { push('/history')}}>
                            <HistoryIcon />
                        </IconButton>
                        </div>
                    </Toolbar>
                    <Divider/>
                </AppBar>
            </div>
            <Switch>
                <Route path="/about">
                    <About/>
                </Route>
                <Route path="/newhome">
                    <NewHome/>
                </Route>
                <Route path="/settings">
                    <Settings/>
                </Route>
                <Route path="/history">
                    <History/>
                </Route>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
            </>
        // </ConfigContext.Provider>

            )
};
