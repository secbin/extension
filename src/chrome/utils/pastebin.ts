import { API_ERROR, DEFAULT_API_KEY_B64 } from '../../constants';

export async function postPastebin(encryptQuery: string, apiKey: string) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  myHeaders.append(
    'Cookie',
    '_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D'
  );

  const effectiveKey = apiKey || atob(DEFAULT_API_KEY_B64);

  const content = new URLSearchParams();
  content.append('api_dev_key', effectiveKey);
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

  const text = await response.text();

  if (!response.ok || text.startsWith('Bad API Request')) {
    return API_ERROR + text;
  }

  return text;
}

export async function getPastebin(link: string) {
  const array = link.split('/');
  if (array[3]) {
    link = array[3];
  } else {
    link = array[0];
  }

  const response = await fetch(
    `https://cors.securebin.workers.dev/?https://pastebin.com/raw/` + link
  );

  const text = await response.text();

  if (!response.ok || text.startsWith('Bad API Request')) {
    return API_ERROR + text;
  }

  return text;
}

export async function isValidDevKey(apiKey: string) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  myHeaders.append(
    'Cookie',
    '_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D'
  );

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

  // Since we can't call any API besides post, the error message tells us if the key is invalid
  if (!response.ok) {
    const error = await response.text();
    return !error.includes('invalid api_dev_key');
  }

  return null;
}
