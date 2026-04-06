import React, { useContext } from 'react';
import List from '@mui/material/List';
import { Typography } from '@mui/material';
import moment from 'moment';
import { AppContext, HistoryType } from '../contexts/AppContext';
import { useHistory } from 'react-router-dom';
import { printDateInCorrectFormat } from '../chrome/utils';
import DateOrderedItem from '../components/common/DateOrderedItem';
import StatusIcon from '../components/editor/StatusIcon';

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

  let lastLastDate = '';

  return (
    <>
      {history && history?.length ? (
        <Typography
          variant="h2"
          sx={{ paddingLeft: '20px', paddingTop: '20px', marginBottom: '10px' }}
        >
          History
        </Typography>
      ) : (
        <>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <StatusIcon variant={'empty-history'} />
          </div>
        </>
      )}
      <List sx={{ padding: '20px' }}>
        {history
          ?.slice()
          .reverse()
          .map((item: HistoryType, index: number) => {
            let showItem = false;
            const itemTime = moment(item.date).format('MMMM D, YYYY');
            if (itemTime !== lastLastDate) {
              lastLastDate = itemTime;
              showItem = true;
            }
            return (
              <DateOrderedItem
                key={itemTime}
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
