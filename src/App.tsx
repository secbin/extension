import React, {useReducer, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { About } from "./routes/About";
import { Home } from "./routes/Home";
import { NewHome } from "./routes/NewHome";
import SettingsIcon from '@mui/icons-material/Settings';
import { Settings } from './routes/Settings'
import { useHistory } from "react-router-dom";
import usePasteBinSearch from './hooks/usePasteBinSearchJS';
import './App.css';
import {AppBar, createMuiTheme, createTheme, Divider, IconButton, ThemeProvider, Toolbar, Typography, useTheme } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import { ChevronLeft } from '@mui/icons-material';
import History from "./routes/History";
import HistoryIcon from '@mui/icons-material/History';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { ConfigContext } from './ConfigContext';
import { DEFAULT_CONTEXT } from './constants'
import logoimg from '../assets/img/securebinlogo.svg'
import logoimg_dark from '../assets/img/securebinlogo_dark.svg'

import {green, purple } from '@mui/material/colors';
import Process from './routes/Process';
function reducer(state: any, action: any) {
    switch(action.type) {
        case "add":
            return action.payload;
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        boxShadow: "none",
        backgroundColor: "#fff",
        // marginBottom: 64,
    },
    content: {
        marginTop: 64,
    },
    hoverStyle: {
        '&:hover': {
            transition: '0.15s',
            transform: 'scale(1.05)'
        },
        '&:active': {
            transition: '0.08s',
            opacity: 0.9,
            transform: 'scale(1.07)'
        },
        transition: '0.15s'
    }
}));

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

const theme = createMuiTheme({
        palette: {
        // type: light,
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#00acf5',
        },
        text: {
            secondary: 'rgba(0,0,0,0.54)',
        },
    },
    typography: {
        h1: {
            fontSize: 36,
            fontWeight: 700,
        },
        h2: {
            fontSize: 24,
            fontWeight: 800,
        },
        h3: {
            fontSize: 14,
            fontWeight: 700,
            opacity: 0.7,
        },
        h4: {
            fontSize: 14,
            fontWeight: 500,
            opacity: 0.7,
            marginBottom: 12,
            paddingTop: 12,
        },
        subtitle2: {
            fontSize: 12,
            fontWeight: 400,
            opacity: 0.6,
        },
        body1: {
            fontSize: 15,
            lineHeight: 1.2,
            fontWeight: 500,
        },
        button: {
            fontSize: 14,
            textTransform: 'none',
            fontWeight: 600,
        },
    }
});

export const App = () => {

    const [appConfig, setAppConfig] = useState({})
    // const [securebin, dispatch] = useReducer(reducer, {});
    let {push, goBack} = useHistory();
    const classes = useStyles();


    // const theme = useTheme();

    return (
        // <div className="App">
        //     <header className="App-header">
        <ThemeProvider theme={theme}>
         {/*<ConfigContext.Provider value={{securebin, dispatch}}>*/}
            <>
                <div>
                <AppBar className={classes.root} position="fixed" enableColorOnDark>

                    <Toolbar >
                        <img className={classes.hoverStyle} src="/securebinlogo.svg" alt="logo" onClick={() => { push('/home')}}/>
                        <div style={{marginLeft: 'auto'}}>
                        {/*<IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { goBack()}}>*/}
                        {/*    <ChevronLeft />*/}
                        {/*</IconButton>*/}
                        <IconButton className={classes.hoverStyle} aria-label="menu" sx={{ mr: 1 }} disableRipple onClick={() => { push('/processing')}}>
                            <AcUnitIcon />
                        </IconButton>
                        <IconButton className={classes.hoverStyle} aria-label="menu" sx={{ mr: 1 }} disableRipple onClick={() => { push('/history')}}>
                            <HistoryIcon />
                        </IconButton>
                        <IconButton className={classes.hoverStyle} aria-label="menu" disableRipple onClick={() => { push('/settings')}}>
                            <SettingsIcon />
                        </IconButton>
                        </div>
                    </Toolbar>
                    <Divider/>
                </AppBar>
            </div>
            <div className={classes.content}>
            <Switch >
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
                <Route path="/processing">
                    <Process/>
                </Route>
                <Route path="/">
                    <NewHome/>
                </Route>
            </Switch>
            </div>
            </>
        {/*</ConfigContext.Provider>*/}
        </ThemeProvider>
            )
};
