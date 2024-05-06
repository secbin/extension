import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import './styles/App.css';
import { AppBar, Box, createMuiTheme, Divider, IconButton, Theme, ThemeProvider, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { HistorySharp as HistoryIcon, SettingsSharp as SettingsIcon, ContentPasteSharp as ContentPaste, EditSharp as EditIcon }  from '@mui/icons-material';
import { AppContext } from './contexts/AppContext';
import { Action, DEFAULT_SETTINGS, Storage } from './constants';
import Settings from './routes/Settings';
import History from "./routes/History";
import Result from './routes/Result';
import Editor from "./routes/Editor";
import { getLocalItem, getSyncItem, setSyncItem } from "./chrome/utils/storage";
import SubHeader from './components/common/SubHeader';
import ApiKeyConfig from "./routes/ApiKeyConfig";
import EncConfig from "./routes/EncConfig";
import Support from "./routes/Support";

export const App = () => {
    const { state, dispatch } = React.useContext(AppContext);
    const [darkmode, setDarkmode] = useState(state.settings.theme);

    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            boxShadow: "none",
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
        },
        content: {
            flexGrow: 1,
            willChange: 'scroll-position',
            scrollBehavior: 'smooth'
        },
        hoverStyle: {
            fontSize: '0.9em',
            '&:hover': {
                transition: '0.10s',
                color: darkmode ? '#d5d5d5' : '#4b4b4b',
            },
            '&:active': {
                transition: '0.08s',
                color: '#4b4b4b',
            },
            transition: '0.15s'
        },
        background: {
            bgColor: 'background.default',
        },
    }));

    let { push } = useHistory();
    const location = useLocation();

    useEffect(() => {

        getSyncItem(Storage.THEME, (data) => {
            console.log("UPDATING THEME", data[Storage.THEME]);
            dispatch({ type: Action.SET_THEME, payload: {theme: JSON.parse(data[Storage.THEME])} });
        });

        getSyncItem(Storage.DRAFT, (data) => {
            // Only update draft if there is content
            if(data[Storage.DRAFT]?.plaintext?.length) {
                dispatch({ type: Action.SET_DRAFT, payload: JSON.parse(data[Storage.DRAFT]) });
            }
        });

        console.log("getting SETTINGS");

        getSyncItem(Storage.SETTINGS, (data) => {

            console.log("UPDATING SETTINGS", data[Storage.SETTINGS]);


            dispatch({ type: Action.SET_SETTINGS, payload: JSON.parse(data[Storage.SETTINGS]) //|| DEFAULT_SETTINGS//
         });

        });

        getLocalItem(Storage.HISTORY, (data) => {
            console.log("HISTORY FROM STORAGE", {history: data[Storage.HISTORY]});
            dispatch({ type: Action.SET_HISTORY, payload: data[Storage.HISTORY] || [] });
        })

        // Preserve app state for 10 seconds
        getSyncItem(Storage.APP, (data) => {
            const TEN_SECONDS = 10 * 1000;
            if (data[Storage.APP]) {
                const { location, date } = JSON.parse(data[Storage.APP])
                if(date + TEN_SECONDS > new Date().getTime()) {
                    push(location);
                }
            }
        });
    }, []);

    useEffect(() => {
        console.log("UPDATING THEME");
        setDarkmode(state.settings.theme);
    }, [state.settings.theme]);

    useEffect(() => {

        dispatch({ type: Action.UPDATE_NAVIGATION, payload: {location} });
        // setSyncItem(Storage.APP, JSON.stringify({location, date: new Date().getTime()}));
    }, [location]);

    useEffect(() => {
    }, [state.app.subheader]);

    const classes = useStyles();

    // setTimeout(() => { setDarkmode(true) }, 4000);

    const theme = createMuiTheme({
        palette: {
            mode: darkmode ? 'dark' : 'light',
            primary: {
                main: darkmode ? '#4795fd' : '#1D6BC6',
            },
            secondary: {
                main: darkmode ? '#f3f3f3' : '#242424'
            },
        },
        shape: {
            borderRadius: 12,
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
                opacity: 0.95,
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
                borderRadius: '50px',
            },
        },
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        // padding: '10px 16px',
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    elevation8: {
                        border: '1px solid #eaeaea',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.07), 0px 1px 1px rgba(0, 0, 0, 0.06)',
                    },
                },
            },
        },
    });

    return (
            <ThemeProvider theme={theme}>
                <Box className={classes.container} sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
                    <div className={classes.background}>
                        <AppBar sx={{bgcolor: 'background.default'}} className={classes.root} position="relative" enableColorOnDark>
                            <Toolbar sx={{bgcolor: 'background.default' }}>
                                <img src={darkmode ? '/securebinlogo_dark.svg' : '/securebinlogo.svg'} alt="logo"/>
                                <div style={{marginLeft: 'auto'}}>
                                    {<IconButton className={classes.hoverStyle} aria-label="Latest paste" sx={{ mr: 1 }} disableRipple onClick={() => { push('/home')}}>
                                        <EditIcon />
                                    </IconButton>}
                                    {/*{<IconButton className={classes.hoverStyle} aria-label="Latest paste" sx={{ mr: 1 }} disableRipple onClick={() => { push('/result')}}>*/}
                                    {/*<ContentPaste />*/}
                                    {/*</IconButton>}*/}
                                    <IconButton className={classes.hoverStyle} aria-label="History" sx={{ mr: 1 }} disableRipple onClick={() => { push('/history')}}>
                                        <HistoryIcon />
                                    </IconButton>
                                    <IconButton className={classes.hoverStyle} aria-label="Settings" disableRipple onClick={() => { push('/settings')}}>
                                        <SettingsIcon />
                                    </IconButton>
                                </div>
                            </Toolbar>
                            <Divider/>
                            {!!state.app.subheader && <SubHeader/>}
                        </AppBar>
                    </div>
                    <Box className={classes.content} sx={{bgcolor: 'background.default', color: 'text.primary', overflow: 'auto'}}>
                        <Switch>
                            <Route path="/home">
                                <Editor/>
                            </Route>
                            <Route path="/settings">
                                <Settings/>
                            </Route>
                            {/*Sub heading routes*/}
                            <Route path="/apikey">
                                <ApiKeyConfig />
                            </Route>
                            <Route path="/encconfig">
                                <EncConfig />
                            </Route>
                            <Route path="/support">
                                <Support />
                            </Route>
                            <Route path="/history">
                                <History/>
                            </Route>
                            <Route path="/result">
                                <Result/>
                            </Route>
                            <Route path="/">
                                <Editor/>
                            </Route>

                        </Switch>
                    </Box>
                </Box>
            </ThemeProvider>
    )
};
