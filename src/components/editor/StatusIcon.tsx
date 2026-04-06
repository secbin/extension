import React from 'react';
import { Typography } from '@mui/material';
import { HistoryType } from '../../contexts/AppContext';
import { printDateInCorrectFormat } from '../../chrome/utils';
import { ContentPaste, CheckCircle, Error, History } from '@mui/icons-material';

const iconSx = {
  fontSize: 80,
  width: '100%',
  margin: '20px 0',
};

export type LStatusType = {
  variant: 'error' | 'success' | 'empty-history' | 'empty-clipboard';
  result?: HistoryType;
};

const StatusIcon = ({ variant, result }: LStatusType) => {
  if (variant === 'success') {
    return (
      <>
        <CheckCircle sx={{ ...iconSx, color: 'green' }} />
        {result?.pastebinlink && result?.pastebinlink.length ? (
          <Typography variant={'h2'}>Posted to Pastebin</Typography>
        ) : (
          <Typography variant={'h2'}>Encrypted Ciphertext</Typography>
        )}
        {result && (
          <Typography variant={'h4'}>
            {printDateInCorrectFormat(result?.date)}
            {result?.key_length
              ? ` with ${result?.key_length * 8} ${result?.enc_mode}`
              : ''}
          </Typography>
        )}
      </>
    );
  } else if (variant === 'error') {
    return (
      <>
        <Error sx={{ ...iconSx, color: 'red' }} />
        <Typography variant={'h2'}>Error posting to Pastebin</Typography>
      </>
    );
  } else if (variant === 'empty-clipboard') {
    return (
      <div style={{ marginTop: 164 }}>
        <ContentPaste sx={{ ...iconSx, color: '#b6b6b6' }} />
        <Typography sx={{ color: '#b6b6b6' }} variant={'h2'}>
          No Encryptions
        </Typography>
      </div>
    );
  } else {
    return (
      <div style={{ marginTop: 164 }}>
        <History sx={{ ...iconSx, color: '#b6b6b6' }} />
        <Typography sx={{ color: '#b6b6b6' }} variant={'h2'}>
          No History
        </Typography>
      </div>
    );
  }
};

export default StatusIcon;
