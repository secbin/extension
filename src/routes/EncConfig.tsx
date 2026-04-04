import React, { useLayoutEffect } from 'react';
import {
  Box,
  Checkbox,
  DialogContent,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AppContext } from '../contexts/AppContext';
import { Action, ENCRYPTION_METHODS, KEY_LENGTHS } from '../constants';
import SettingsItem from '../components/SettingsItem';

const useStyles = makeStyles(() => ({
  menuItem: {
    height: 10,
    boxShadow: 'none',
  },
  select: {
    height: 32,
    marginBottom: 8,
    marginTop: 8,
  },
}));

const EncConfig = () => {
  const classes = useStyles();
  const { state, dispatch } = React.useContext(AppContext);
  const { enc_mode, key_length, encryption } = state.settings;

  const keyLengthHandler = (e: SelectChangeEvent<number>) => {
    dispatch({
      type: Action.UPDATE_SETTINGS,
      payload: { ...state.settings, key_length: Number(e.target.value) },
    });
  };

  const encModeHandler = (e: SelectChangeEvent<string>) => {
    dispatch({
      type: Action.UPDATE_SETTINGS,
      payload: { ...state.settings, enc_mode: e.target.value },
    });
  };

  const encryptionHandler = () => {
    const newEncryption = {
      ...state.settings,
      encryption: !encryption,
    };
    dispatch({ type: Action.UPDATE_SETTINGS, payload: newEncryption });
  };

  useLayoutEffect(() => {
    dispatch({
      type: Action.SET_SUBHEADER,
      payload: {
        subheader: {
          back_button: true,
          primary: 'Encryption',
          secondary: 'Enable or customize features',
          custom_button: null,
        },
      },
    });
  }, [dispatch, state.app.location]);

  return (
    <Box>
      <DialogContent
        sx={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
          scrollBehavior: 'smooth',
          transform: 'translateZ(0)',
        }}
      >
        <Typography variant={'h4'}>Encryption</Typography>
        <SettingsItem
          multilineSecondaryText={true}
          primary={'Encryption Features'}
        >
          <Checkbox checked={encryption} onChange={encryptionHandler} />
        </SettingsItem>
        <Typography variant={'body2'}>
          {
            "SecureBin can be used to safely encrypt text before it's posted on Pastebin.org."
          }
        </Typography>
        <br />
        <Typography variant={'h4'}>Advanced</Typography>
        <SettingsItem primary={'Encryption Algorithm'}>
          <Select
            className={classes.select}
            value={enc_mode}
            disabled={!encryption}
            onChange={encModeHandler}
          >
            {ENCRYPTION_METHODS.map(item => (
              <MenuItem
                classes={{ root: classes.menuItem }}
                key={item.value}
                value={item.value}
              >
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </SettingsItem>

        <SettingsItem primary={'Key Length'}>
          <Select
            className={classes.select}
            value={key_length}
            onChange={keyLengthHandler}
            disabled={!encryption}
          >
            {KEY_LENGTHS.map(item => (
              <MenuItem
                className={classes.menuItem}
                key={item.value}
                value={item.value}
              >
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </SettingsItem>
      </DialogContent>
    </Box>
  );
};

export default EncConfig;
