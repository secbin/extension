import React from "react";
import { Card, IconButton, InputBase, Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import {copyTextClipboard} from "../../chrome/utils"
import { ContentPaste } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  copybox: {
    paddingLeft: 10,
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
    width: 390,
  },
  copyboxLarge: {
    paddingLeft: 10,
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
  value?: string,

}

const Copybox = ({ title, value }: LCopyboxType) => {
  const classes = useStyles();

  return (
      <>
        {title && (<Typography variant={'h4'}>{title}</Typography>)}
        <Card className={classes.copyboxLarge}>
          <InputBase
              className={classes.textArea}
              placeholder={value}
              value={value}/>
          <IconButton onClick={() => copyTextClipboard(value)} disableRipple>
            <ContentPaste color="primary"/>
          </IconButton>
        </Card>
      </>
  )

}

export default Copybox;
