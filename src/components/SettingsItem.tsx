import React from 'react';
import { Card, ListItem, ListItemText } from '@mui/material';

export type LSettingsItemType = {
  primary: string;
  secondary?: string;
  children: React.ReactNode;
  multilineSecondaryText?: boolean;
};

const SettingsItem = ({
  primary,
  secondary,
  children,
  multilineSecondaryText = false,
}: LSettingsItemType) => {
  return (
    <>
      <Card
        sx={{
          borderRadius: '6px',
          border: '1px solid rgba(170,170,170,0.25)',
          boxShadow: '0 0 7px 0 rgba(0,0,0,0.04)',
          marginBottom: '14px',
        }}
      >
        <ListItem>
          <ListItemText
            secondaryTypographyProps={{ lineHeight: '1.1' }}
            primaryTypographyProps={{
              marginBottom: multilineSecondaryText ? '3px' : '0',
            }}
            primary={primary}
            secondary={secondary ?? null}
          />
          {children}
        </ListItem>
      </Card>
    </>
  );
};

export default SettingsItem;
