import React, { useContext } from 'react';
import {
  Button,
  Checkbox,
  List,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Action, DRAFT_TIMEOUT_OPTIONS } from '../constants';
import { AppContext } from '../contexts/AppContext';
import SettingsItem from '../components/SettingsItem';
import ButtonRedirect from '../components/dialog/ButtonRedirect';
import WarningDialog from '../components/dialog/WarningDialog';
import ResetWarningDialog from '../components/dialog/ResetWarningDialog';

const useStyles = makeStyles(() => ({
  pageHeading: {
    paddingLeft: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  list: {
    padding: 20,
  },
}));

export default function Settings() {
  const classes = useStyles();
  const { state, dispatch } = useContext(AppContext);
  const { api_key, enc_mode, theme, key_length, encryption, draft_timeout } =
    state.settings;

  const clearHistory = () => {
    dispatch({
      type: Action.OPEN_DIALOG,
      payload: { dialog_id: 'reset_history' },
    });
  };

  const themeHandler = () => {
    dispatch({
      type: Action.UPDATE_THEME,
      payload: { theme: !theme },
    });
  };

  const resetSettings = () => {
    dispatch({
      type: Action.OPEN_DIALOG,
      payload: { dialog_id: 'reset_settings' },
    });
  };

  return (
    <div>
      <WarningDialog />
      <ResetWarningDialog />
      <Typography variant="h2" className={classes.pageHeading}>
        Settings
      </Typography>
      <List className={classes.list}>
        <Typography variant={'h4'}>Theme</Typography>
        <SettingsItem primary={'Dark Mode'}>
          <Checkbox checked={theme} onChange={themeHandler} />
        </SettingsItem>

        <Typography variant={'h4'}>Encryption</Typography>
        <SettingsItem
          primary={'Encryption'}
          secondary={
            encryption
              ? `Enabled with ${key_length * 8}-bit ${enc_mode} `
              : 'Disabled'
          }
        >
          <ButtonRedirect iconButton value={'Configure'} url={'/encconfig'} />
        </SettingsItem>

        <Typography variant={'h4'}>Pastebin API</Typography>
        <SettingsItem
          primary={'API Key'}
          secondary={api_key ? 'Set' : 'Not Set'}
        >
          <ButtonRedirect
            iconButton
            value={api_key ? 'Change' : 'Set Key'}
            url={'/apikey'}
          />
        </SettingsItem>

        <Typography variant={'h4'}>Help</Typography>
        <SettingsItem primary={'Support'}>
          <ButtonRedirect iconButton value={'Get Help'} url={'/support'} />
        </SettingsItem>

        <Typography variant={'h4'}>Draft</Typography>
        <SettingsItem
          primary={'Keep draft for'}
          secondary={'Text is restored when you reopen the extension'}
        >
          <Select
            value={draft_timeout}
            onChange={(e: SelectChangeEvent<number>) => {
              dispatch({
                type: Action.UPDATE_SETTINGS,
                payload: { draft_timeout: Number(e.target.value) },
              });
            }}
            sx={{ height: 32 }}
            size="small"
          >
            {DRAFT_TIMEOUT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </SettingsItem>

        <Typography variant={'h4'}>Reset</Typography>
        <SettingsItem primary={'Clear History'}>
          <Button onClick={clearHistory}>Clear</Button>
        </SettingsItem>

        <SettingsItem primary={'Reset Settings'}>
          <Button onClick={resetSettings}>Reset</Button>
        </SettingsItem>
      </List>
    </div>
  );
}
