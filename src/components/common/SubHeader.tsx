import React, { Fragment, useContext } from 'react';
import {
  Card,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronLeft } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';

const useStyles = makeStyles(() => ({
  subHeader: {
    borderRadius: 0,
    borderBottom: '1px solid rgba(170,170,170,0.25)',
    boxShadow: '0 0 20px 0 rgba(0,0,0,0.07)',
    width: '100vw',
  },
}));

const SubHeader = () => {
  const { state } = useContext(AppContext);
  const { subheader } = state.app;

  const classes = useStyles();
  const { goBack } = useHistory();
  //
  // useEffect(() => {
  //     // Rerender
  // }, [location])

  if (subheader) {
    return (
      <>
        <Card className={classes.subHeader}>
          <ListItem sx={{ padding: '8px 6px' }}>
            {subheader?.back_button && (
              <Fragment>
                <IconButton
                  sx={{ borderRadius: '4px' }}
                  onClick={() => {
                    goBack();
                  }}
                >
                  <ChevronLeft color="secondary" />
                </IconButton>
                <Divider
                  sx={{ margin: '0 6px' }}
                  orientation="vertical"
                  flexItem
                />
              </Fragment>
            )}
            {(subheader?.primary || subheader?.secondary) && (
              <ListItemText
                sx={{ textAlign: 'center', marginLeft: '-50px' }}
                primary={subheader?.primary}
                secondary={subheader?.secondary}
              />
            )}
          </ListItem>
        </Card>
      </>
    );
  }

  return null;
};

export default SubHeader;
