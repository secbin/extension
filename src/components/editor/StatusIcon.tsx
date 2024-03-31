import React from "react";
import clsx from "clsx";
import {Box, Typography} from '@mui/material';
import { makeStyles } from "@mui/styles";
import { HistoryType } from "../../contexts/AppContext";
import { printDateInCorrectFormat } from "../../chrome/utils"
import { ContentPaste, CheckCircle, Error, History } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  icon: {
    fontSize: 80,
    width: '100%',
    margin: "20px 0",
  },
  green: {
    color: 'green',
  },
  red: {
    color: 'red',
  },
  grey: {
    color: '#b6b6b6',
  },
    topMargin: {
        marginTop: 164,
    }
}));

export type LStatusType = {
  variant: 'error' | 'success' | 'empty-history' | 'empty-clipboard',
  result?: HistoryType,

}

const StatusIcon = ({variant, result}: LStatusType) => {
  const classes = useStyles();

  if(variant === 'success') {
    return (
        <>
          <CheckCircle className={clsx(classes.icon, classes.green)}/>
      {result?.pastebinlink && result?.pastebinlink.length ?
          <Typography variant={'h2'}>Posted to Pastebin</Typography> :
          <Typography variant={'h2'}>Encrypted Ciphertext</Typography>
      }

        {result && (<Typography variant={'h4'}>{printDateInCorrectFormat(result?.date)}{result?.key_length ? ` with ${result?.key_length * 8} ${result?.enc_mode}` : ""}</Typography>)}
        </>
    );
  } else if (variant === 'error') {
    return (
        <>
          <Error className={clsx(classes.icon, classes.red)} />
          <Typography variant={'h2'}>Error posting to Pastebin</Typography>
        </>
    );
  } else if (variant === 'empty-clipboard') {
    return (
        <div className={classes.topMargin}>
            <ContentPaste className={clsx(classes.icon, classes.grey)} />
            <Typography className={classes.grey} variant={'h2'}>No Encryptions</Typography>
        </div>
    );
  } else {
      return (
            <div className={classes.topMargin}>
              <History className={clsx(classes.icon, classes.grey)} />
              <Typography className={classes.grey} variant={'h2'}>No History</Typography>
            </div>
      );
  }

}

export default StatusIcon;
