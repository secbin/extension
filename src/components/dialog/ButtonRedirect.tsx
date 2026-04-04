import * as React from 'react';
import { Button, IconButton } from '@mui/material';

import { useHistory } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';

interface ButtonRedirectProps {
  external?: boolean;
  url: string;
  iconButton?: boolean;
  value?: string;
}

export default function ButtonRedirect(props: ButtonRedirectProps) {
  const { push } = useHistory();

  const handleClickOpen = () => {
    if (props.external) {
      window.open(props.url);
    } else {
      push(props.url);
    }
  };

  return (
    <div>
      {props.external || props.iconButton ? (
        <IconButton onClick={handleClickOpen}>
          <ChevronRight />
        </IconButton>
      ) : (
        <Button onClick={handleClickOpen}>{props.value}</Button>
      )}
    </div>
  );
}
