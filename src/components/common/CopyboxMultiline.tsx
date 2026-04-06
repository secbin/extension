import React from 'react';
import { Box, Button, Card, InputBase, Typography } from '@mui/material';
import { copyTextClipboard } from '../../chrome/utils';
import { ContentPasteRounded } from '@mui/icons-material';

const cardSx = {
  borderRadius: '6px',
  border: '1px solid rgba(170,170,170,0.25)',
  boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
  marginBottom: '14px',
};

export type LCopyboxType = {
  title?: string;
  value?: string;
  allowCopy?: boolean;
};

const CopyboxMultiline = ({ title, value, allowCopy = true }: LCopyboxType) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {title && <Typography variant={'h4'}>{title}</Typography>}
        {allowCopy && (
          <Button
            sx={{
              '&:hover': { backgroundColor: 'transparent' },
              padding: 0,
              margin: 0,
              fontSize: 12,
              fontWeight: 500,
              marginRight: '3px',
              minWidth: 0,
              '& .MuiButton-startIcon': {
                marginRight: '4px',
                fontSize: '12px',
                '& svg': {
                  fontSize: '15px',
                },
              },
            }}
            onClick={() => copyTextClipboard(value)}
            size={'small'}
            startIcon={<ContentPasteRounded sx={{ fontSize: '12px' }} />}
            disableRipple
          >
            Copy
          </Button>
        )}
      </Box>
      <Card sx={cardSx}>
        <InputBase
          sx={{
            width: 400,
            fontFamily: 'Menlo, monospace',
            fontSize: 14,
            letterSpacing: '-1px',
            '& .MuiInputBase-inputMultiline': {
              padding: '9px',
              overflowX: 'hidden',
            },
            overflow: 'hidden',
            textAlign: 'left',
            padding: '0px',
          }}
          placeholder={value}
          value={value}
          multiline
          rows={9}
        />
      </Card>
    </>
  );
};

export default CopyboxMultiline;
