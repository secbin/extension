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
  // var request = new XMLHttpRequest();
  //
  // request.open("POST", "https://cors-anywhere.herokuapp.com/https://pastebin.com/api/api_post.php", true);
  //
  // request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //
  // request.send(`api_dev_key=${apiKey}&api_option=paste&api_paste_private=0&api_paste_code=${encryptQuery}`);
  // fetch("https://cors-anywhere.herokuapp.com/https://pastebin.com/api/api_post.php/", {
  // body: `api_dev_key=${apiKey}&api_option=paste&api_paste_private=0&api_paste_code=${encryptQuery}`,
  // headers: {
  //   "Content-Type": "application/x-www-form-urlencoded"
  // },
  // method: "POST"

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append("Cookie", "_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D");

var urlencoded = new URLSearchParams();
urlencoded.append("api_dev_key", "bYYcefkxnd18LJMggTKIH2Vg8m8QP-N0");
urlencoded.append("api_paste_code", "test");
urlencoded.append("api_option", "paste");

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: urlencoded,
  redirect: 'follow'
};

fetch("https://cors-anywhere.herokuapp.com/https://pastebin.com/api/api_post.php", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


return [result, error];
// console.log(`https://pastebin.com/api/api_post.php/api_dev_key=${apiKey}&api_option=paste&api_paste_code=${encryptQuery}`);
//   useEffect(() => {
//    let ignore = false;
//    const controller = new AbortController();
//    async function fetchSearchResults() {
//     // let responseBody : string[] = [];
//     let responseBody = {};
//     //let responseBody = useState<string>('');
//      setLoading(true);
//      try {
//        const response = await fetch(
//         // `https://api.cl1p.net/${query}`,
//         // `https://cors-anywhere.herokuapp.com/https://api.cl1p.net/${query}`,
//           //`https://pastebin.com/raw/${query}`,
//             `https://cors-anywhere.herokuapp.com/https://pastebin.com/api/api_post.php/api_dev_key=${apiKey}&api_option=paste&api_paste_code=${encryptQuery}`,
//           //`https://cors-anywhere.herokuapp.com/https://scrape.pastebin.com/api_scrape_item.php?i=${query}`,
//           //`https://reqbin.com/echo/get/json`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/x-www-form-urlencoded"},
//           signal: controller.signal,
//
//          }
//        );
//        responseBody = await response.text();
//      } catch (e) {
//        if (e instanceof DOMException) {
//          console.log("== HTTP request cancelled")
//        } else {
//          setError(true);
//          throw e;
//        }
//      }
//      if (!ignore) {
//        setLoading(false);
//        setError(false);
//        console.log(responseBody);
//        setResult(responseBody || []);
//        //result = responseBody;
//      }
//    }
//    if (encryptQuery) {
//      fetchSearchResults()
//    }
//    return () => {
//      controller.abort();
//      ignore = true;
//    }
//  }, [ encryptQuery ]);
//
//
//  return [ result, error ];

















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
