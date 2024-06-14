import React from "react";
import {Box, Button, Card, IconButton, InputBase, Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import {copyTextClipboard} from "../../chrome/utils"
import { ContentPaste, ContentPasteRounded } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  copybox: {
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
    // width: 390,
  },
  copyboxLarge: {
    padding: '0px 0px 0px 0px',
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
    // width: 390,
  },
  textArea: {
    width: 400,
  },
}));

export type LCopyboxType = {
  title?: string,
  value?: string,
  allowCopy?: boolean,

}

const CopyboxMultiline = ({ title, value, allowCopy = true }: LCopyboxType) => {
  const classes = useStyles();

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
          <InputBase
              className={classes.textArea}
              placeholder={value}
              value={value}
              multiline
              sx={{fontFamily: 'Menlo, monospace', fontSize: 14, letterSpacing: '-1px', '& .MuiInputBase-inputMultiline': {
                  padding: '9px', overflowX: 'hidden'
                }, overflow: 'hidden', textAlign: 'left', padding: '0px'}}
              rows={9}

          />
          {/*<IconButton sx={{position: 'absolute'}} onClick={() => copyTextClipboard(value)} disableRipple>*/}
          {/*  <ContentPaste color="primary"/>*/}
          {/*</IconButton>*/}
        </Card>
      </>
  )

}

export default CopyboxMultiline;
