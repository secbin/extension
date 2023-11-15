import React from "react";
import { Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import { Action, MAX_ENC_TEXT_LENGTH, MAX_PASTEBIN_TEXT_LENGTH } from "../constants";
import ErrorIcon from "@mui/icons-material/Error";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  counterContainer: {
    margin: '15px',
    display: 'inline-flex',
  },
  counter: {
    fontSize: 11,
  },
  red: {
    color: 'red',
    fontWeight: 600
  },
  grey: {
    color: 'grey'
  },
}));

export type LTextCounterType = {
  menu: string,
  textLength: number,

}

const TextCounter = ({ menu, textLength }: LTextCounterType) => {
  const classes = useStyles();

  let MAX = MAX_ENC_TEXT_LENGTH;
  if (menu === Action.ENCRYPT_PASTEBIN) { // button is pastebin enc
    MAX = MAX_PASTEBIN_TEXT_LENGTH;
  }
  let safe = textLength < MAX

  return (
      <div className={classes.counterContainer}>
        {!safe && <ErrorIcon className={clsx(classes.red, classes.counter)} sx={{ mr: 0.5, mb: -0.25 }} />}
        <Typography className={clsx(safe ? classes.grey : classes.red, classes.counter)} variant={'body1'} >{textLength}/{MAX}</Typography>
      </div>
  );

}


export default TextCounter;
