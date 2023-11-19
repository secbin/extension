import React from "react";
import { Card, IconButton, Typography } from '@mui/material';
import { makeStyles } from "@mui/styles";
import moment from "moment";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {HistoryType} from "../../contexts/AppContext";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
}));

export type LDateOrderedItemType = {
  showDateHeading?: boolean,
  id?: string,
  date: Date,
  primary: string,
  secondary?: string,
  clickHandler: (item: HistoryType) => void,
  payload: HistoryType,
}

const DateOrderedItem = ({ showDateHeading, id, primary, date, secondary, clickHandler, payload }: LDateOrderedItemType) => {
  const classes = useStyles();

  return (
      <>
        {showDateHeading && (<Typography variant='h4'>{moment(date).format('MMMM D, YYYY')}</Typography>)}
        <Card classes={{root: classes.card}}>
          <ListItem key={id ? id : primary}>
            <ListItemText primary={primary} secondary={secondary} />
            <IconButton color="primary" aria-label="Unlock CipherText" onClick={(e) => clickHandler(payload)}>
              <InfoOutlinedIcon />
            </IconButton>
          </ListItem>
        </Card>
      </>
  )

}

export default DateOrderedItem;
