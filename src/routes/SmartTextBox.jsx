import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';

export default function CustomizedInputBase() {
  return (
      <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 440, height: 300, overflow: 'auto' }}
      >
        <InputBase
            sx={{ ml: 1, flex: 1 }}
            multiline
            placeholder="Enter a PasteBin link or ciphertext to decrypt, plaintext to encrypt"
            inputProps={{ 'aria-label': 'search google maps', 'rows': '5'  }}
        />
      </Paper>
  );
}
