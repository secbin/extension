import React, {useState, useEffect } from 'react'

function usePasteBinPost(encryptQuery){
  // POST request using fetch with error handling
    const [result, setResult] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
  const apiKey = "klVQoqGaWEZGAuv9qALhwCN94jyuBQ7w";
if (encryptQuery){
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
}



return [result, error];

}
export default usePasteBinPost
