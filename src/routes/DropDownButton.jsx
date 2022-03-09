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
import usePasteBinPost from '../hooks/usePasteBinPost';
import { MAX_TEXT_LENGTH } from '../constants'
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import { makeStyles, createStyles } from '@mui/styles';
import { encrypt, decrypt } from "../chrome/utils/crypto";


const useStyles = makeStyles(theme => ({
    counterContainer: {
        // alignContent: 'center',
        margin: 15,
        marginTop: 10
    },
    counter: {
        fontSize: 11,
    },
    red: {
        color: 'red',
        fontWeight: 600
    },
    grey: {
        color: 'grey'
    },
    bottomSection: {
        display: 'flex',
    },
    hoverStyle: {
        '&:hover': {
            transition: '0.15s',
            transform: 'scale(1.02)'
        },
        '&:active': {
            transition: '0.08s',
            opacity: 0.9,
            transform: 'scale(1.035)'
        },
        transition: '0.15s'
    },
    large: {
        fontSize: '36px',
    },
}));


const StyledMenu = styled((props) => (
  <Menu
      open={false} elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
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

export function TextCounter(props) {
    const classes = useStyles();
    let safe = props.textLength < MAX_TEXT_LENGTH
    return (
        <div className={classes.counterContainer}>
        {!safe && <ErrorIcon className={clsx(classes.red, classes.counter)} sx={{mr: 0.5, mb: -0.25}}/>}
        <Typography className={clsx(safe ? classes.grey : classes.red, classes.counter)} variant={'p'}>{props.textLength}/{MAX_TEXT_LENGTH}</Typography>
        </div>
    );
}


export default function CustomizedMenus() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [text, setText] = React.useState("");
  const [link, setLink] = React.useState("");
  const [postLink, setPostLink] = React.useState("");
  const [pasteBinLink, setPasteBinLink] = usePasteBinPost(postLink);
  const [searchPasteBin, setSearchPasteBin] = usePasteBinSearchJS(link);
  const [newPlaintext, setNewPlaintext] = React.useState("");
  const [buttonEnabled, setButtonEnabled] = React.useState(false)
  const [menu, setMenu] = React.useState("Encrypt")

  const inputSize = text.length
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);


  };
  const handleClose = (text) => {
    setAnchorEl(null);
    setMenu(text)
  };

  const performAction = async (e) => {
    let buttonText = e.target.innerText || "";
    // console.log(buttonText, " == ", "Create Pastebin")
    if(buttonText === "Encrypt to Pastebin") {
        console.log(text);
        let res = encrypt(text)
        //sets the pasteBinLink to output of usePasteBinPost
        console.log(res.data);
        setPostLink(res.data);
    }else if (buttonText === "Encrypt Plaintext") {
      let res = await encrypt(text)
      console.log(res.data) //TODO - new window or somthing
      console.log(res.key)
    } else if (buttonText === "Decrypt Pastebin") {
      // not working but it should be.
      setLink(text);
      console.log(searchPasteBin);
      if(searchPasteBin){
        let key = prompt("Please enter your key"); //TODO - Decrypt will probably need two text boxes
        let res = decrypt(searchPasteBin, key)
        console.log("SETTING NEW PLAINTEXT TO:",res.data);
        setNewPlaintext(res.data);
      }


    } else if (buttonText === "Decrypt Ciphertext"){
      let key = prompt("Please enter your key"); //TODO - Decrypt will probably need two text boxes
      let res = decrypt(text, key)
      console.log(res)
    }
}

  const checkTypeOfText = (e) => {
    setText(e.target.value);
    let buttonText = e.target.value || "";
    if(e.target.value.length > MAX_TEXT_LENGTH) {
        setButtonEnabled(false)
    }
    else if(buttonText.includes("pastebin.com")) {
        // console.log("PASTE BIN LINK FOUND")
        setMenu("Decrypt Pastebin")
        setButtonEnabled(true)
    } else if (buttonText.includes("C_TXT")) {
        // console.log("ENCRYPTED TEXT FOUND")
        setMenu("Decrypt Ciphertext")
        setButtonEnabled(true)

    } else if (buttonText){
        // console.log("PLAINTEXT FOUND")
        setMenu("Encrypt to Pastebin")
        setButtonEnabled(true)

    } else {
        setButtonEnabled(false)
    }

  };



  let hey = clsx(text.length < 30 && classes.large)
  return (
      <>
          <div>
          <InputBase
              className={clsx(text.length < 30 && '24')}
              sx={{ width: 440, height: 464, overflow: 'hidden', fontSize: clsx(text.length < 350 ? '24px' : '16px'), backgroundColor: 'white', textAlign: 'left', padding: 2}}
              multiline
              autoFocus
              rows={clsx(text.length < 350 ? 13 : 20)}
              onChange={checkTypeOfText}
              placeholder="Type or paste (⌘ + V) text you want to encrypt or a Pastebin.com link or ciphertext you want to decrypt here..."
              inputProps={{ 'aria-label': 'text to encrypt or decrypt', 'height': '300px' }}
          />

        <Divider />
      <div className={classes.bottomSection}>
      <TextCounter textLength={text.length}/>
      <Card
          className={classes.hoverStyle}
          style={{minWidth: 100, textAlign: 'center', backgroundColor: '#1D6BC6', color: 'white', margin: 15, borderRadius: 50, marginLeft: 'auto'}}>
      <ListItemButton sx={{ ml: 1, flex: 1, height: 40, textAlign: 'center', fontWeight: 800 }}
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
                      aria-label="encryption/decryption options">
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
          <MenuItem sx={{ fontWeight: 700, color: 'grey' }} disabled dense disableRipple>
              Select Action
          </MenuItem>
          <Divider/>
        <MenuItem onClick={e => handleClose("Encrypt Plaintext")} dense disableRipple>
          <LockIcon />
          Encrypt Plaintext
        </MenuItem>
        <MenuItem onClick={e => handleClose("Encrypt to Pastebin")} dense disableRipple>
          <LockIcon />
          Encrypt to Pastebin
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={e => handleClose("Decrypt Plaintext")} dense disableRipple>
          <LockOpenIcon />
          Decrypt Plaintext
        </MenuItem>
        <MenuItem onClick={e => handleClose("Decrypt Pastebin")} dense disableRipple>
          <LockOpenIcon />
          Decrypt Pastebin
        </MenuItem>
      </StyledMenu>

      </div>
      {pasteBinLink.includes("API") ? <p> Bad Url, or out of pastes.</p> : <p>{pasteBinLink}</p>}
      {searchPasteBin ? <p>{searchPasteBin}</p> : <p> Sorry Invalid Link</p> }
      {newPlaintext ? <p>{newPlaintext}</p> : <p></p> }

    </div>
      </>
  );
}
