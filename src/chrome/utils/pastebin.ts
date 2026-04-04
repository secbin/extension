import { API_ERROR } from '../../constants';

export async function postPastebin(encryptQuery: string, apiKey: string) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  if (!apiKey) {
    alert('Please set your Pastebin API key');
    return API_ERROR;
  }

  const content = new URLSearchParams();
  content.append('api_dev_key', apiKey);
  content.append('api_paste_code', encryptQuery);
  content.append('api_option', 'paste');

  const response = await fetch(
    `https://cors.securebin.workers.dev/?https://pastebin.com/api/api_post.php`,
    {
      method: 'POST',
      headers: myHeaders,
      body: content,
      redirect: 'follow',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return API_ERROR + error;
  }

  return await response.text();
}

export async function getPastebin(link: string) {
  //Gets webpage from url
  const array = link.split('/');
  if (array[3]) {
    link = array[3];
  } else {
    link = array[0];
  }

  const response = await fetch(
    `https://cors.securebin.workers.dev/?https://pastebin.com/raw/` + link
  );

  if (!response.ok) {
    const error = await response.text();
    return API_ERROR + error;
  }

  return await response.text();
}

export async function isValidDevKey(apiKey: string) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  const content = new URLSearchParams();
  content.append('api_dev_key', apiKey);
  content.append('api_option', 'userdetails');

  const response = await fetch(
    `https://cors.securebin.workers.dev/?https://pastebin.com/api/api_post.php`,
    {
      method: 'POST',
      headers: myHeaders,
      body: content,
      redirect: 'follow',
    }
  );

  // Since we can't really call any API besides post, depending on the error message we can conclude whether the api_dev_key is incorrect
  if (!response.ok) {
    const error = await response.text();

    if (error.includes('invalid api_dev_key')) {
      return false;
    } else {
      return true;
    }
  }

  return null;
}
