import moment from 'moment';

export const openLinkInNewWindow = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const getCurrentTabUrl = (
  callback: (url: string | undefined) => void
): void => {
  const queryInfo = { active: true, lastFocusedWindow: true };

  chrome.tabs &&
    chrome.tabs.query(queryInfo, tabs => {
      callback(tabs[0].url);
    });
};

export const getCurrentTabUId = (
  callback: (url: number | undefined) => void
): void => {
  const queryInfo = { active: true, lastFocusedWindow: true };

  chrome.tabs &&
    chrome.tabs.query(queryInfo, tabs => {
      callback(tabs[0].id);
    });
};

export const printDateInCorrectFormat = (dateOfEvent: number | Date) => {
  const now = new Date().getTime();
  const eventDate = new Date(dateOfEvent).getTime();
  if (Math.abs(now - eventDate) < 170000000) {
    return moment(dateOfEvent).fromNow();
  } else {
    return moment(dateOfEvent).format('MMMM D, YYYY');
  }
};

export function copyTextClipboard(text: string | undefined) {
  if (!text) {
    return;
  }

  //Create a textbox field where we can insert text to.
  const copyFrom = document.createElement('textarea');

  //Set the text content to be the text you wished to copy.
  copyFrom.textContent = text;

  //Append the textbox field into the body as a child.
  //"execCommand()" only works when there exists selected text, and the text is inside
  //document.body (meaning the text is part of a valid rendered HTML element).
  document.body.appendChild(copyFrom);

  //Select all the text!
  copyFrom.select();

  //Execute command
  document.execCommand('copy');

  //(Optional) De-select the text using blur().
  copyFrom.blur();

  //Remove the textbox field from the document.body, so no other JavaScript nor
  //other elements can get access to this.
  document.body.removeChild(copyFrom);
}
