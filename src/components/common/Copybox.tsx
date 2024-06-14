import React from "react";
import {Box, Card, IconButton, Button, InputBase, Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import {copyTextClipboard, openLinkInNewWindow} from "../../chrome/utils"
import { ContentPaste, ContentPasteRounded, VisibilityOffOutlined, VisibilityOutlined, OpenInNewRounded } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  copybox: {
    padding: '5px 0 5px 10px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
    width: 390,
  },
  copyboxLarge: {
    padding: '7px 0 7px 10px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
    width: 390,
  },
  textArea: {
    width: 350,
  },
}));

export type LCopyboxType = {
  title?: string,
  value: string,
  type?: string,
  allowCopy?: boolean,
  toggleVisibility?: boolean,
  large?: boolean,
  openInNew?: boolean,
}

// <IconButton onClick={() => copyTextClipboard(value)} disableRipple>
//   <ContentPasteRounded color="primary" sx={{fontSize: '16px'}}/>
// </IconButton>

const Copybox = ({ title, value, type = 'text', allowCopy = false, toggleVisibility = false, large = true, openInNew = false }: LCopyboxType) => {
  const classes = useStyles();
  const [show, setShow] = React.useState(toggleVisibility ? 'password' : 'text');

  const toggleVisibilityHandler = () => {
    setShow(show === 'password' ? 'text' : 'password');
  }

  return (
      <>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        {title && (<Typography variant={'h4'}>{title}</Typography>)}
        {allowCopy && (
            <Button sx={{'&:hover': { backgroundColor: 'transparent'}, padding: 0, margin: 0, fontSize: 12, fontWeight: 500, marginRight: '3px', minWidth: 0, '& .MuiButton-startIcon': { // Target the startIcon specifically
                marginRight: '4px', fontSize: '12px', '& svg': {
                  fontSize: '15px'}
              }}} onClick={() => copyTextClipboard(value)}
                    size={'small'} startIcon={<ContentPasteRounded sx={{ fontSize: '12px' }} />} disableRipple>Copy</Button>
        )}
        </Box>
        <Card className={classes.copyboxLarge}>
          {large ? (
              <InputBase
                  className={classes.textArea}
                  placeholder={value}
                  type={show}
                  sx={{fontFamily: 'Menlo, monospace', fontSize: 18, letterSpacing: '-0.1px', fontWeight: 700}}
                  value={value}
              />
          ) :
            (
            <InputBase
                className={classes.textArea}
                placeholder={value}
                type={show}
                sx={{fontFamily: 'Menlo, monospace', fontSize: 14, letterSpacing: '-0.1px'}}
                value={value}
            />
          )}
          {false && (
            <IconButton size={'small'} onClick={() => toggleVisibilityHandler()} disableRipple>
              {show === 'password' ? <VisibilityOutlined color="primary"/> : <VisibilityOffOutlined color="primary"/>}
            </IconButton>
          )}
          {openInNew && (
              <IconButton size={'small'} onClick={() => openLinkInNewWindow(value)} disableRipple>
                {<OpenInNewRounded color="primary"/>}
              </IconButton>
          )}
        </Card>
      </>
  )

}

export default Copybox;
