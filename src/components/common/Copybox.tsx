import React from 'react';
import {
  Box,
  Card,
  IconButton,
  Button,
  InputBase,
  Typography,
} from '@mui/material';
import { copyTextClipboard, openLinkInNewWindow } from '../../chrome/utils';
import {
  ContentPasteRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
  OpenInNewRounded,
} from '@mui/icons-material';

const cardSx = {
  padding: '7px 0 7px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(170,170,170,0.25)',
  boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
  marginBottom: '14px',
  width: 390,
};

export type LCopyboxType = {
  title?: string;
  value: string;
  allowCopy?: boolean;
  toggleVisibility?: boolean;
  large?: boolean;
  openInNew?: boolean;
};

const Copybox = ({
  title,
  value,
  allowCopy = false,
  toggleVisibility = false,
  large = true,
  openInNew = false,
}: LCopyboxType) => {
  const [show, setShow] = React.useState(
    toggleVisibility ? 'password' : 'text'
  );

  const toggleVisibilityHandler = () => {
    setShow(show === 'password' ? 'text' : 'password');
  };

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
        {large ? (
          <InputBase
            sx={{
              width: 350,
              fontFamily: 'Menlo, monospace',
              fontSize: 18,
              letterSpacing: '-0.1px',
              fontWeight: 700,
            }}
            placeholder={value}
            type={show}
            value={value}
          />
        ) : (
          <InputBase
            sx={{
              width: 350,
              fontFamily: 'Menlo, monospace',
              fontSize: 14,
              letterSpacing: '-0.1px',
            }}
            placeholder={value}
            type={show}
            value={value}
          />
        )}
        {toggleVisibility && (
          <IconButton
            size={'small'}
            onClick={() => toggleVisibilityHandler()}
            disableRipple
          >
            {show === 'password' ? (
              <VisibilityOutlined color="primary" />
            ) : (
              <VisibilityOffOutlined color="primary" />
            )}
          </IconButton>
        )}
        {openInNew && (
          <IconButton
            size={'small'}
            onClick={() => openLinkInNewWindow(value)}
            disableRipple
          >
            <OpenInNewRounded color="primary" />
          </IconButton>
        )}
      </Card>
    </>
  );
};

export default Copybox;
