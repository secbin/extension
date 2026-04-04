import React, { useState, useEffect } from 'react';

function usePasteBinSearch(query) {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const array = query.split('/');
  if (array[3]) {
    query = array[3];
  } else {
    query = array[0];
  }

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function fetchSearchResults() {
      let responseBody = {};
      setLoading(true);
      //if it is a link we need to do a different query
      try {
        const response = await fetch(
          `https://cors.securebin.workers.dev/?https://pastebin.com/raw/${query}`,
          {
            signal: controller.signal,
          }
        );
        responseBody = await response.text();
      } catch (e) {
        if (e instanceof DOMException) {
          console.log('== HTTP request cancelled');
        } else {
          setError(true);
          throw e;
        }
      }

      if (!ignore) {
        setLoading(false);
        setError(false);
        //console.log(responseBody);
        setResult(responseBody || []);
      }
    }

    if (query) {
      fetchSearchResults();
    }
    return () => {
      controller.abort();
      ignore = true;
    };
  }, [query]);

  return [result, error];
}
export default usePasteBinSearch;
