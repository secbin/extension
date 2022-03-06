import React, {useState, useEffect } from 'react'


function usePasteBinSearchJS(query){
  const [result, setResult] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const apiKey = "wlhKnA7nnD5FDKtLebQLDUszOn6TituB";
  const url ="https://pastebin.com/raw/";


  useEffect(() => {
   let ignore = false;
   const controller = new AbortController();
   async function fetchSearchResults() {
    let responseBody = {};
     setLoading(true);
     //if it is a link we need to do a different query
     if(query.includes("pastebin") || query.includes("https") || query.includes("/")){
       try {
         const response = await fetch(
           `https://cors.securebin.workers.dev/?${query}`,
          // `https://cors-anywhere.herokuapp.com/https://api.cl1p.net/${query}`,
            //`https://pastebin.com/raw/${query}`,
             // `https://cors-anywhere.herokuapp.com/https://pastebin.com/raw/${query}`,
             // `http://localhost:8080/https://pastebin.com/raw/${query}`,
            //`https://cors-anywhere.herokuapp.com/https://scrape.pastebin.com/api_scrape_item.php?i=${query}`,
            //`https://reqbin.com/echo/get/json`,
            {
            signal: controller.signal,

           }
         );
         responseBody = await response.text();
       } catch (e) {
         if (e instanceof DOMException) {
           console.log("== HTTP request cancelled")
         } else {
           setError(true);
           throw e;
         }

     }
     }else{
       console.log("Is a code:", query);
       try {
         const response = await fetch(
           `https://cors.securebin.workers.dev/?https://pastebin.com/raw/${query}`,
          // `https://cors-anywhere.herokuapp.com/https://api.cl1p.net/${query}`,
            //`https://pastebin.com/raw/${query}`,
             // `https://cors-anywhere.herokuapp.com/https://pastebin.com/raw/${query}`,
             // `http://localhost:8080/https://pastebin.com/raw/${query}`,
            //`https://cors-anywhere.herokuapp.com/https://scrape.pastebin.com/api_scrape_item.php?i=${query}`,
            //`https://reqbin.com/echo/get/json`,
            {
            signal: controller.signal,

           }
         );
         responseBody = await response.text();
       } catch (e) {
         if (e instanceof DOMException) {
           console.log("== HTTP request cancelled")
         } else {
           setError(true);
           throw e;
         }

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
