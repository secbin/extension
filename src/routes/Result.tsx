import React from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { AppContext, HistoryType } from '../contexts/AppContext';
import { useParams } from 'react-router-dom';
import StatusIcon from '../components/editor/StatusIcon';
import Copybox from '../components/common/Copybox';
import CopyboxMultiline from '../components/common/CopyboxMultiline';
import { Action } from '../constants';
import moment from 'moment/moment';

const useStyles = makeStyles(theme => ({
  center: {
    width: '100%',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  left: {
    textAlign: 'left',
    marginLeft: 10,
    marginRight: 10,
  },
}));

const Result = () => {
  const { id } = useParams<{ id?: string }>();

  const { state, dispatch } = React.useContext(AppContext);
  const [result, setResult] = React.useState<HistoryType | null>();

  const determineTitle = (result: HistoryType | null | undefined) => {
    if (result?.pastebinlink) {
      return result.pastebinlink;
    } else if (result?.key) {
      return 'Encrypted Draft';
    } else {
      return 'Draft';
    }
  };

  useEffect(() => {
    const idx = id !== undefined ? parseInt(id, 10) : NaN;
    if (!isNaN(idx) && idx >= 0) {
      setResult(state.history[idx]);
    } else {
      setResult(
        state.history.length ? state.history[state.history.length - 1] : null
      );
    }
  }, [id, state.history]);

  useEffect(() => {
    dispatch({
      type: Action.SET_SUBHEADER,
      payload: {
        subheader: {
          back_button: true,
          primary: determineTitle(result),
          secondary: result?.date
            ? moment(result.date).format('MMMM D, YYYY')
            : null,
          custom_button: null,
        },
      },
    });
  }, [dispatch, result]);

  const classes = useStyles();

  const isPasteBin = !!result?.pastebinlink;
  const hasError = result?.pastebinlink?.includes('PasteBin Error') ?? false;
  const errorMessage = result?.pastebinlink?.replace('PasteBin Error', '') ?? '';

  return (
    <div className={classes.center}>
      {result ? (
        <>
          {isPasteBin && !hasError ? (
            <StatusIcon result={result} variant={'success'} />
          ) : null}
          <div className={classes.left}>
            {result?.pastebinlink &&
              !result?.pastebinlink.includes('PasteBin Error') && (
                <Copybox
                  value={result?.pastebinlink}
                  title={'Pastebin Link'}
                  allowCopy
                  openInNew
                />
              )}
            {isPasteBin && hasError && errorMessage && (
              <Copybox
                value={errorMessage}
                title={'PasteBin Error'}
                allowCopy={false}
              />
            )}
            {result.enc_text && (
              <CopyboxMultiline
                value={result.enc_text}
                title={
                  result.key
                    ? 'Ciphertext'
                    : result.pastebinlink
                    ? 'Pastebin Content'
                    : 'Plaintext'
                }
              />
            )}
            {result.key && (
              <Copybox
                value={result.key}
                title={'Passkey'}
                type={'password'}
                allowCopy={true}
                toggleVisibility={true}
              />
            )}
          </div>
        </>
      ) : (
        <StatusIcon variant={'empty-clipboard'} />
      )}
    </div>
  );
};

export default Result;
