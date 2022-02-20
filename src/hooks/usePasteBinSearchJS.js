import React, {useState, useEffect } from 'react'


function usePasteBinSearchJS(query){
  const [result, setResult] = useState([]);
  //const [result, setResult] = useState<string>('');
  //const [responseFromContent, setResponseFromContent] = useState<string>('');
  //const [setResult] = useState([]);
  //let result : string[] = [];
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const apiKey = "wlhKnA7nnD5FDKtLebQLDUszOn6TituB";
  const url ="https://pastebin.com/raw/";
  useEffect(() => {
   let ignore = false;
   const controller = new AbortController();
   async function fetchSearchResults() {
    // let responseBody : string[] = [];
    let responseBody = {};
    //let responseBody = useState<string>('');
     setLoading(true);
     try {
       const response = await fetch(
         // `https://scrape.pastebin/api_scrape_item.php?i=${query}`,
          `https://reqbin.com/echo/get/json`,
          { signal: controller.signal }
       );
       responseBody = await response.json();
     } catch (e) {
       if (e instanceof DOMException) {
         console.log("== HTTP request cancelled")
       } else {
         setError(true);
         throw e;
       }
     }
     if (!ignore) {
       setLoading(false);
       setError(false);
       console.log(responseBody);
       setResult(responseBody || []);
       //result = responseBody;
     }
   }
   if (query) {
     fetchSearchResults()
   }
   return () => {
     controller.abort();
     ignore = true;
   }
 }, [ query ]);

 return [ result, error ];
}
export default usePasteBinSearchJS
