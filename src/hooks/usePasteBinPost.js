import React, {useState, useEffect } from 'react'
import PasteBinApi from 'pastebin-js'

// function usePasteBinPost(encryptQuery){
//   const [result, setResult] = useState([]);
//   const [ loading, setLoading ] = useState(false);
//   const [ error, setError ] = useState(false);
//
//
//
//
// var pastebin = new PasteBinApi();
//   pastebin
//     .createPaste(encryptQuery)
//     .then(function (data) {
//       // paste successfully created, data contains the id
//       console.log(data);
//       setResult(data);
//     })
//     .fail(function (err) {
//       // Something went wrong
//       console.log(err);
//       setError(err);
//     })
//     return [ result, error ];
// }


function usePasteBinPost(encryptQuery){
  // POST request using fetch with error handling
    const [result, setResult] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
  const apiKey = "wlhKnA7nnD5FDKtLebQLDUszOn6TituB";
console.log(`https://pastebin.com/api/api_post.php/api_dev_key=${apiKey}&api_option=paste&api_paste_code=${encryptQuery}`);
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
        // `https://api.cl1p.net/${query}`,
        // `https://cors-anywhere.herokuapp.com/https://api.cl1p.net/${query}`,
          //`https://pastebin.com/raw/${query}`,
            `https://cors-anywhere.herokuapp.com/https://pastebin.com/api/api_post.php/api_dev_key=${apiKey}&api_option=paste&api_paste_code=${encryptQuery}`,
          //`https://cors-anywhere.herokuapp.com/https://scrape.pastebin.com/api_scrape_item.php?i=${query}`,
          //`https://reqbin.com/echo/get/json`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded"},
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
     if (!ignore) {
       setLoading(false);
       setError(false);
       console.log(responseBody);
       setResult(responseBody || []);
       //result = responseBody;
     }
   }
   if (encryptQuery) {
     fetchSearchResults()
   }
   return () => {
     controller.abort();
     ignore = true;
   }
 }, [ encryptQuery ]);


 return [ result, error ];

















    // const requestOptions = {
    //     method: 'POST',
    //     headers: { "Content-type": "text/html"}
    // };
    // fetch(`https://pastebin.com/api/api_post.php/api_dev_key=${apiKey}&api_option=paste&api_paste_code=${encryptQuery}`, requestOptions)
    //     .then(async response => {
    //         //const isJson = response.headers.get('content-type')?.includes('application/json');
    //         const data =  await response.text();
    //
    //         // check for error response
    //         if (!response.ok) {
    //             // get error message from body or default to response status
    //             const error = (data && data.message) || response.status;
    //             return Promise.reject(error);
    //         }
    //
    //         this.setState({ postId: data.id })
    //     })
    //     .catch(error => {
    //         this.setState({ errorMessage: error.toString() });
    //         console.error('There was an error!', error);
    //     });
    //    return [data, error]
}
export default usePasteBinPost
