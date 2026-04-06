import React from 'react';
import { Card, IconButton, Typography } from '@mui/material';
import moment from 'moment';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { HistoryType } from '../../contexts/AppContext';
import { ChevronRight } from '@mui/icons-material';

const cardSx = {
  borderRadius: '6px',
  border: '1px solid rgba(170,170,170,0.25)',
  boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
  marginBottom: '14px',
};

export type LDateOrderedItemType = {
  showDateHeading?: boolean;
  id?: string;
  date: number;
  primary: string;
  secondary?: string;
  clickHandler: (item: HistoryType) => void;
  payload: HistoryType;
};

const DateOrderedItem = ({
  showDateHeading,
  id,
  primary,
  date,
  secondary,
  clickHandler,
  payload,
}: LDateOrderedItemType) => {
  return (
    <>
      {showDateHeading && (
        <Typography variant="h4">
          {moment(date).format('MMMM D, YYYY')}
        </Typography>
      )}
      <Card sx={cardSx}>
        <ListItem key={id ?? primary}>
          <ListItemText primary={primary} secondary={secondary} />
          <IconButton
            aria-label="More details"
            onClick={() => clickHandler(payload)}
          >
            <ChevronRight />
          </IconButton>
        </ListItem>
      </Card>
    </>
  );
};

export default DateOrderedItem;
