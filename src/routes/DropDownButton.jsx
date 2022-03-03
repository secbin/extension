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
import Card from '@mui/material/Card';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import InputBase from '@mui/material/InputBase';
import usePasteBinSearchJS from '../hooks/usePasteBinSearchJS'
// import usePasteBinPost from '../hooks/usePasteBinPost';
import usePasteBinPost from '../hooks/usePasteBinPost2';




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
  const [buttonEnabled, setButtonEnabled] = React.useState(false)
  const [menu, setMenu] = React.useState("Encrypt")
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);


  };
  const handleClose = (text) => {
    setAnchorEl(null);
    setMenu(text)
  };

  const performAction = (e) => {
      let buttonText = e.target.innerText || "";
      // console.log(buttonText, " == ", "Create Pastebin")
      if(buttonText === "Create Pastebin") {
          alert("clicked")
          const [pasteBinLink, error] = usePasteBinPost("hello this is a test");
          console.log(error);
          alert("PASTE BIN LINK IN THEORY: ", pasteBinLink);

      } else if (buttonText === "Decrypt Pastebin") {


      } else if (buttonText === "Decrypt Ciphertext"){

      }


  }

  const checkTypeOfText = (e) => {

    let buttonText = e.target.value || ""
    if(buttonText.includes("pastebin.com")) {
        // console.log("PASTE BIN LINK FOUND")
        setMenu("Decrypt Pastebin")
        setButtonEnabled(true)
    } else if (buttonText.includes("=")) {
        // console.log("ENCRYPTED TEXT FOUND")
        setMenu("Decrypt Ciphertext")
        setButtonEnabled(true)

    } else if (buttonText){
        // console.log("PLAINTEXT FOUND")
        setMenu("Create Pastebin")
        setButtonEnabled(true)
    } else {
        setButtonEnabled(false)
    }

  };

  // @ts-ignore
  // @ts-ignore
  return (
      <>
          <div>
          <InputBase
              sx={{ width: 440, minHeight: 300, maxHeight: 300, overflow: 'hidden', fontSize: 24, backgroundColor: 'white', textAlign: 'left', padding: 2}}
              multiline
              autoFocus
              rows={8}
              onChange={checkTypeOfText}
              placeholder="Type or paste (⌘ + V) text you want to encrypt here, paste a Pastebin.com link, or ciphertext you want to here..."
              inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px' }}
          />

        <Divider />
        <Card style={{width: '230px', textAlign: 'center', backgroundColor: '#1D6BC6', color: 'white', margin: 10, borderRadius: 50, marginLeft: 'auto'}}>
      <ListItemButton sx={{ ml: 1, flex: 1, height: 45 }}
        onClick={performAction}
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        disabled={!buttonEnabled}
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation

      >
          <ListItemText>{menu}</ListItemText>
          {/*<Divider sx={{ height: 28, m: 0.5, color: 'white', borderColor: 'white' }} orientation="vertical" />*/}
          <IconButton color="primary" sx={{ p: '10px' }} sx={{ color: 'white'}} onClick={handleClick}
                      aria-label="directions">
              <KeyboardArrowDownIcon />
          </IconButton>
      </ListItemButton>

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
      </>
  );
}
