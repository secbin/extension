import React, { useContext } from 'react';
import List from '@mui/material/List';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { AppContext, HistoryType } from '../contexts/AppContext';
import { useHistory } from 'react-router-dom';
import { printDateInCorrectFormat } from '../chrome/utils';
import DateOrderedItem from '../components/common/DateOrderedItem';
import StatusIcon from '../components/editor/StatusIcon';

const useStyles = makeStyles(theme => ({
  pageHeading: {
    paddingLeft: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  list: {
    padding: 20,
  },
  center: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
}));

export default function History() {
  const { push } = useHistory();
  const { state } = useContext(AppContext);
  const { history } = state;

  const handleHistory = (index: number) => {
    push(`/result/${index}`);
  };

  const handleTitle = (item: HistoryType) => {
    if (item?.pastebinlink) {
      return item.pastebinlink;
    } else {
      if (!!item?.key_length && !!item.enc_mode) {
        return `${item.key_length * 8} ${item.enc_mode} Encrypted Draft`;
      } else {
        return 'Draft';
      }
    }
  };

  const classes = useStyles();
  let lastLastDate = '';

  return (
    <>
      {history && history?.length ? (
        <Typography variant="h2" className={classes.pageHeading}>
          History
        </Typography>
      ) : (
        <>
          <div className={classes.center}>
            <StatusIcon variant={'empty-history'} />
          </div>
        </>
      )}
      <List className={classes.list}>
        {history
          ?.slice()
          .reverse()
          .map((item: any, index: number) => {
            let showItem = false;
            const itemTime = moment(item.date).format('MMMM D, YYYY');
            if (itemTime !== lastLastDate) {
              lastLastDate = itemTime;
              showItem = true;
            }
            return (
              <DateOrderedItem
                key={item.id ?? index}
                showDateHeading={showItem}
                clickHandler={() => handleHistory(history.length - index - 1)}
                payload={item}
                primary={handleTitle(item)}
                secondary={printDateInCorrectFormat(item.date)}
                date={item.date}
              />
            );
          })}
      </List>
    </>
  );
}
