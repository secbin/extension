import React, {useState, useEffect } from 'react'
import PasteBinApi from 'pastebin-js'

function usePasteBinSearchJS(query){
  const [result, setResult] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  var fs =require('fs');

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
