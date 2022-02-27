import React, {useState, useEffect } from 'react'
import PasteBinApi from 'pastebin-js'

function usePasteBinSearchJS(query){
  const [result, setResult] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
<<<<<<< HEAD
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
         `https://cors.securebin.workers.dev/?https://pastebin.com/raw/${query}`,
        // `https://cors-anywhere.herokuapp.com/https://api.cl1p.net/${query}`,
          //`https://pastebin.com/raw/${query}`,
           // `https://cors-anywhere.herokuapp.com/https://pastebin.com/raw/${query}`,
           // `http://localhost:8080/https://pastebin.com/raw/${query}`,
          //`https://cors-anywhere.herokuapp.com/https://scrape.pastebin.com/api_scrape_item.php?i=${query}`,
          //`https://reqbin.com/echo/get/json`,
          {
          signal: controller.signal,
=======
  var fs =require('fs');
>>>>>>> 96ae4ac3b2b604aada9948387908739d4cd2c0ec

  var pastebin = new PasteBinApi();
  pastebin
  .getPaste(query)
  .then(function (data) {
    // data contains the raw paste
    console.log(data);
    setResult(data)
  })
  .fail(function (err) {
    // Something went wrong
    console.log(err);
  })

 return [ result, error ];
}
export default usePasteBinSearchJS
