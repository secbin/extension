import React from 'react';
import { Typography } from '@mui/material';
import {
  Action,
  MAX_ENC_TEXT_LENGTH,
  MAX_PASTEBIN_TEXT_LENGTH,
} from '../../constants';
import ErrorIcon from '@mui/icons-material/Error';

export type LTextCounterType = {
  menu: string;
  textLength: number;
};

const TextCounter = ({ menu, textLength }: LTextCounterType) => {
  let MAX = MAX_ENC_TEXT_LENGTH;
  if (menu === Action.ENCRYPT_PASTEBIN) {
    MAX = MAX_PASTEBIN_TEXT_LENGTH;
  }
  const safe = textLength < MAX;

  return (
    <div style={{ margin: '15px', display: 'inline-flex' }}>
      {!safe && (
        <ErrorIcon
          sx={{
            color: 'red',
            fontWeight: 600,
            fontSize: 11,
            mr: 0.5,
            mb: -0.25,
          }}
        />
      )}
      <Typography
        sx={{
          color: safe ? 'grey' : 'red',
          fontWeight: safe ? 400 : 600,
          fontSize: 11,
        }}
        variant={'body1'}
      >
        {textLength}/{MAX}
      </Typography>
    </div>
  );
};

export default TextCounter;
