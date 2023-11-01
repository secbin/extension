import React from "react";
import { Card, ListItem, ListItemText } from '@mui/material';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 6,
    border: '1px solid',
    borderColor: 'rgba(170,170,170,0.25)',
    boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
}));

export type LSettingsItemType = {
  primary: string,
  secondary?: string,
  children: any,
}

const SettingsItem = ({ primary, secondary, children }: LSettingsItemType) => {
  const classes = useStyles();
  return (
      <>
        <Card classes={{ root: classes.card }}>
          <ListItem>
            <ListItemText
                primary={primary}
                secondary={secondary ? secondary : null}
            />
            {children}
          </ListItem>
        </Card>
      </>
  );

}


export default SettingsItem;
