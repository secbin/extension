import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';





const StyledMenu = styled((props) => (
  <Menu
      open={false} elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '8px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export default function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [menu, setMenu] = React.useState("Encrypt")
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);


  };
  const handleClose = (text) => {
    setAnchorEl(null);
    setMenu(text)
  };

  // @ts-ignore
  // @ts-ignore
  return (
    <div>
      <Card style={{width: '230px', textAlign: 'center', backgroundColor: '#1D6BC6', color: 'white'}}>
      <ListItem sx={{ ml: 1, flex: 1 }}
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
      >
          <ListItemText>{menu}</ListItemText>
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton color="primary" sx={{ p: '10px' }} onClick={handleClick}
                      aria-label="directions">
              <KeyboardArrowDownIcon />
          </IconButton>
      </ListItem>

      </Card>
      <StyledMenu
        // id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={e => handleClose(menu)}
      >
        <MenuItem onClick={e => handleClose("Encrypt Plaintext")} disableRipple>
          <LockIcon />
          Encrypt Plaintext
        </MenuItem>
        <MenuItem onClick={e => handleClose("Encrypt Pastebin")} disableRipple>
          <LockIcon />
          Encrypt Pastebin
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={e => handleClose("Decrypt Plaintext")} disableRipple>
          <LockOpenIcon />
          Decrypt Plaintext
        </MenuItem>
        <MenuItem onClick={e => handleClose("Decrypt Pastebin")} disableRipple>
          <LockOpenIcon />
          Decrypt Pastebin
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
