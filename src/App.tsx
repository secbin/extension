import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { About } from "./routes/About";
import { Home } from "./routes/Home";
import { NewHome } from "./routes/NewHome";
import SettingsIcon from '@mui/icons-material/Settings';
import { Settings } from './routes/Settings'
import { useHistory } from "react-router-dom";

// import usePasteBinSearch from './hooks/usePasteBinSearch';
import './App.css';
import {AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import History from "./routes/History";
import HistoryIcon from '@mui/icons-material/History';

export const App = () => {
    let {push, goBack} = useHistory();
    return (
        <>
        <div>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { goBack()}}>
                        <ChevronLeft />
                    </IconButton>
                    <Typography variant="h6" color="inherit" component="div">
                        SecureBin
                    </Typography>
                    <IconButton edge="end" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { push('/settings')}}>
                        <SettingsIcon />
                    </IconButton>
                    <IconButton edge="end" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { push('/history')}}>
                        <HistoryIcon />
                    </IconButton>
                </Toolbar>
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
    )
};
