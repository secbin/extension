import React, { useLayoutEffect } from 'react';
import { Box, DialogContent, Typography } from '@mui/material';
import { AppContext } from '../contexts/AppContext';
import { Action } from '../constants';
import SettingsItem from '../components/SettingsItem';
import ButtonRedirect from '../components/dialog/ButtonRedirect';

const EncConfig = () => {
  const { state, dispatch } = React.useContext(AppContext);

  useLayoutEffect(() => {
    dispatch({
      type: Action.SET_SUBHEADER,
      payload: {
        subheader: {
          back_button: true,
          primary: 'Help',
          secondary: '',
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
        <Typography variant={'h4'}>Support</Typography>
        <SettingsItem multilineSecondaryText={true} primary={'FAQs'}>
          <ButtonRedirect external url={'https://securebin.org/support/'} />
        </SettingsItem>
        <SettingsItem
          multilineSecondaryText={true}
          primary={'Report a bug or request feature'}
        >
          <ButtonRedirect
            external
            url={'https://github.com/secbin/extension/issues/new'}
          />
        </SettingsItem>
        <Typography variant={'h4'}>Contribute</Typography>
        <SettingsItem
          multilineSecondaryText={true}
          primary={'Contribute to project'}
          secondary={'Contribute to this open-source project'}
        >
          <ButtonRedirect
            external
            url={'https://github.com/secbin/extension/pulls'}
          />
        </SettingsItem>
        <SettingsItem
          multilineSecondaryText={true}
          primary={'Support to project'}
          secondary={'Make a financial donation'}
        >
          <ButtonRedirect external url={'https://securebin.org/donate/'} />
        </SettingsItem>
      </DialogContent>
    </Box>
  );
};

export default EncConfig;
