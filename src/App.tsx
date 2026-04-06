import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import './styles/App.css';
import {
  AppBar,
  Box,
  createTheme,
  Divider,
  IconButton,
  ThemeProvider,
  Toolbar,
} from '@mui/material';
import {
  HistorySharp as HistoryIcon,
  SettingsSharp as SettingsIcon,
  EditSharp as EditIcon,
  CloseSharp as CloseIcon,
} from '@mui/icons-material';
import { AppContext, HistoryType } from './contexts/AppContext';
import { Action, DEFAULT_SETTINGS, Storage } from './constants';
import Settings from './routes/Settings';
import History from './routes/History';
import Result from './routes/Result';
import Editor from './routes/Editor';
import { getLocalItem, getSyncItem } from './chrome/utils/storage';
import SubHeader from './components/common/SubHeader';
import SecurebinLogo from './components/common/SecurebinLogo';
import ApiKeyConfig from './routes/ApiKeyConfig';
import EncConfig from './routes/EncConfig';
import Support from './routes/Support';

const isInjected =
  (window as Window & { __SECUREBIN_INJECTED__?: boolean })
    .__SECUREBIN_INJECTED__ === true;

export const App = () => {
  // Read at render time (not module level) so content/index.tsx has already
  // set window.__SECUREBIN_PORTAL__ before this runs.
  const portalContainer = isInjected
    ? (window as Window & { __SECUREBIN_PORTAL__?: HTMLElement })
        .__SECUREBIN_PORTAL__
    : undefined;
  const { state, dispatch } = React.useContext(AppContext);
  const [darkmode, setDarkmode] = useState(state.settings.theme);

  const { push } = useHistory();
  const location = useLocation();

  // Register dispatch with the content script so it can push history items
  useEffect(() => {
    if (isInjected) {
      window.dispatchEvent(
        new CustomEvent('securebin:register-dispatch', { detail: dispatch })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation bridge — content script dispatches this to change route
  useEffect(() => {
    if (!isInjected) return;
    const handler = (e: Event) => push((e as CustomEvent<string>).detail);
    window.addEventListener('securebin:navigate', handler);
    return () => window.removeEventListener('securebin:navigate', handler);
  }, [push]);

  useEffect(() => {
    getSyncItem(Storage.THEME, data => {
      const raw = data[Storage.THEME];
      if (typeof raw === 'string') {
        dispatch({
          type: Action.SET_THEME,
          payload: { theme: JSON.parse(raw) },
        });
      }
    });

    getSyncItem(Storage.DRAFT, data => {
      const raw = data[Storage.DRAFT];
      if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        if (parsed?.plaintext?.length) {
          dispatch({ type: Action.SET_DRAFT, payload: parsed });
        }
      }
    });

    getSyncItem(Storage.SETTINGS, data => {
      const raw = data[Storage.SETTINGS];
      dispatch({
        type: Action.SET_SETTINGS,
        payload: typeof raw === 'string' ? JSON.parse(raw) : DEFAULT_SETTINGS,
      });
    });

    getLocalItem(Storage.HISTORY, data => {
      dispatch({
        type: Action.SET_HISTORY,
        payload: (data[Storage.HISTORY] as HistoryType[]) || [],
      });
    });

    // Only restore saved location in popup mode
    if (!isInjected) {
      getSyncItem(Storage.APP, data => {
        const TEN_SECONDS = 10 * 1000;
        const raw = data[Storage.APP];
        if (typeof raw === 'string') {
          const { location: savedLocation, date } = JSON.parse(raw);
          if (date + TEN_SECONDS > new Date().getTime()) {
            push(savedLocation);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDarkmode(state.settings.theme);
  }, [state.settings.theme]);

  useEffect(() => {
    dispatch({ type: Action.UPDATE_NAVIGATION, payload: { location } });
  }, [dispatch, location]);

  const theme = createTheme({
    palette: {
      mode: darkmode ? 'dark' : 'light',
      primary: {
        main: darkmode ? '#4795fd' : '#1D6BC6',
      },
      secondary: {
        main: darkmode ? '#f3f3f3' : '#242424',
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
      ...(portalContainer && {
        MuiModal: { defaultProps: { container: portalContainer } },
        MuiPopover: { defaultProps: { container: portalContainer } },
      }),
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {},
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
            boxShadow:
              '0px 4px 12px rgba(0, 0, 0, 0.07), 0px 1px 1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  });

  const iconButtonSx = {
    fontSize: '0.9em',
    transition: '0.15s',
    '&:hover': {
      transition: '0.10s',
      color: darkmode ? '#d5d5d5' : '#4b4b4b',
    },
    '&:active': {
      transition: '0.08s',
      color: '#4b4b4b',
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        <AppBar
          sx={{ bgcolor: 'background.default', boxShadow: 'none' }}
          position="relative"
          enableColorOnDark
        >
          <Toolbar
            sx={{
              bgcolor: 'background.default',
              pr: '12px',
              ...(isInjected && { pl: '20px' }),
            }}
          >
            <SecurebinLogo darkmode={darkmode} />
            <div style={{ marginLeft: 'auto' }}>
              <IconButton
                sx={{ ...iconButtonSx, mr: 1 }}
                aria-label="Latest paste"
                disableRipple
                onClick={() => push('/home')}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ ...iconButtonSx, mr: 1 }}
                aria-label="History"
                disableRipple
                onClick={() => push('/history')}
              >
                <HistoryIcon />
              </IconButton>
              <IconButton
                sx={iconButtonSx}
                aria-label="Settings"
                disableRipple
                onClick={() => push('/settings')}
              >
                <SettingsIcon />
              </IconButton>
              {isInjected && (
                <IconButton
                  sx={{ ...iconButtonSx, ml: 1 }}
                  aria-label="Close"
                  disableRipple
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('securebin:close'))
                  }
                >
                  <CloseIcon />
                </IconButton>
              )}
            </div>
          </Toolbar>
          <Divider />
          {!!state.app.subheader && <SubHeader />}
        </AppBar>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            color: 'text.primary',
            overflow: 'auto',
            willChange: 'scroll-position',
            scrollBehavior: 'smooth',
          }}
        >
          <Switch>
            <Route path="/home">
              <Editor />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
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
              <History />
            </Route>
            <Route path="/result/:id?">
              <Result />
            </Route>
            <Route path="/">
              <Editor />
            </Route>
          </Switch>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
