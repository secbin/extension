import React, { useEffect, useContext, useReducer, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { About } from "./routes/About";
import { Home } from "./routes/Home";
import SettingsIcon from '@mui/icons-material/Settings';
import { Settings } from './routes/Settings'
import { useHistory } from "react-router-dom";
import usePasteBinSearch from './hooks/usePasteBinSearchJS';
import './App.css';
import { AppBar, createMuiTheme, createTheme, Divider, IconButton, ThemeProvider, Toolbar, Typography, useTheme } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import { ChevronLeft } from '@mui/icons-material';
import History from "./routes/History";
import HistoryIcon from '@mui/icons-material/History';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { AppProvider, AppContext } from './AppContext';
import { DEFAULT_CONTEXT } from './constants'
import logoimg from '../assets/img/securebinlogo.svg'
import logoimg_dark from '../assets/img/securebinlogo_dark.svg'
import { Storage } from './constants'
import { green, purple } from '@mui/material/colors';
import Result from './routes/Result';
import { getLocalItem } from './chrome/utils/storage';

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
            mode: 'light',
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
    const { state, dispatch } = React.useContext(AppContext);
    let {push, goBack} = useHistory();
    const classes = useStyles();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        getLocalItem(Storage.HISTORY, (data) => {
            console.log("HISTORY from there", data[Storage.HISTORY]);
            setHistory(data[Storage.HISTORY]);
        })
    }, []);



    // const theme = useTheme();

    return (
        // <div className="App">
        //     <header className="App-header">
        <ThemeProvider theme={theme}>
         <AppProvider>
            <>
                <div>
                <AppBar className={classes.root} position="fixed" enableColorOnDark>

                    <Toolbar >
                        <img className={classes.hoverStyle} src="/securebinlogo.svg" alt="logo" onClick={() => { push('/home')}}/>
                        <div style={{marginLeft: 'auto'}}>
                        {/*<IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => { goBack()}}>*/}
                        {/*    <ChevronLeft />*/}
                        {/*</IconButton>*/}
                        {<IconButton className={classes.hoverStyle} aria-label="Latest paste" sx={{ mr: 1 }} disableRipple onClick={() => { push('/result')}}>
                        <ContentPasteIcon />
                        </IconButton>}
                        <IconButton className={classes.hoverStyle} aria-label="History" sx={{ mr: 1 }} disableRipple onClick={() => { push('/history')}}>
                            <HistoryIcon />
                        </IconButton>
                        <IconButton className={classes.hoverStyle} aria-label="Settings" disableRipple onClick={() => { push('/settings')}}>
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
                <Route path="/home">
                    <Home/>
                </Route>
                <Route path="/settings">
                    <Settings/>
                </Route>
                <Route path="/history">
                    <History/>
                </Route>
                <Route path="/result">
                    <Result/>
                </Route>
                <Route path="/">
                    <Home/>
                </Route>
            </Switch>
            </div>
            </>
        </AppProvider>
        </ThemeProvider>
            )
};
