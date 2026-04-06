import * as React from 'react';
import { Button, IconButton } from '@mui/material';

import { useHistory } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';

type ButtonRedirectProps = {
  url: string;
  external?: boolean;
  iconButton?: boolean;
  value?: string;
};

export default function ButtonRedirect({
  url,
  external,
  iconButton,
  value,
}: ButtonRedirectProps) {
  const { push } = useHistory();

  const handleClickOpen = () => {
    if (external) {
      window.open(url);
    } else {
      push(url);
    }
  };

  return (
    <div>
      {external || iconButton ? (
        <IconButton onClick={handleClickOpen}>
          <ChevronRight />
        </IconButton>
      ) : (
        <Button onClick={handleClickOpen}>{value}</Button>
      )}
    </div>
  );
}
