import React, { useState, useEffect, useContext } from 'react';
import { getSyncItemAsync } from '../chrome/utils/storage';
import { Storage } from '../constants';
import { AppContext } from '../contexts/AppContext';

function usePasteBinPost(encryptQuery) {
  // POST request using fetch with error handling
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { state, dispatch } = useContext(AppContext);
  const { api_key } = state.settings;

  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  myHeaders.append(
    'Cookie',
    '_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D'
  );

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function fetchSearchResults() {
      const apiKey = await getSyncItemAsync(Storage.API_KEY);
      console.log('API key from storage: ', {
        storage: apiKey,
        state: api_key,
      });

      var urlencoded = new URLSearchParams();
      urlencoded.append('api_dev_key', api_key);
      urlencoded.append('api_paste_code', encryptQuery);
      urlencoded.append('api_option', 'paste');

      let responseBody = {};
      setLoading(true);
      try {
        const response = await fetch(
          `https://cors.securebin.workers.dev/?https://pastebin.com/api/api_post.php`,
          {
            signal: controller.signal,
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow',
          }
        );
        responseBody = await response.text();
      } catch (e) {
        console.log(e);
        setError(true);
        throw e;
      }

      if (!ignore) {
        setLoading(false);
        setError(false);
        //console.log(responseBody);
        setResult(responseBody || []);
      }
    }
    if (encryptQuery) {
      fetchSearchResults();
    }
    return () => {
      controller.abort();
      ignore = true;
    };
  }, [encryptQuery]);

  return [result, error];
}
export default usePasteBinPost;
