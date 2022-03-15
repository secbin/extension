import { getSyncItemAsync } from "./storage";
import { Storage, API_ERROR } from "../../constants";


export async function postPastebin(encryptQuery: string) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append(
        "Cookie",
        "_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D"
    );

    const apiKey = await getSyncItemAsync(Storage.API_KEY) as string;
    console.log("API ", apiKey);
    if (apiKey === undefined) {
        alert("Please set your Pastbin API key");
        return API_ERROR;
    }

    var content = new URLSearchParams();
    content.append("api_dev_key", apiKey);
    content.append("api_paste_code", encryptQuery);
    content.append("api_option", "paste");
    console.log("encryptQuery ", encryptQuery);
    console.log("Content ", content);

    const response = await fetch(`https://cors.securebin.workers.dev/?https://pastebin.com/api/api_post.php`, {
        method: "POST",
        headers: myHeaders,
        body: content,
        redirect: "follow",
    });

    if (!response.ok) {
        const error = await response.text();
        console.log(error);
        return API_ERROR + error;
    }

    const link = await response.text();
    console.log(link);
    return link;
}

export async function getPastebin(link: string) {
    //Gets webpage from url
    const array = link.split("/");
    if (array[3]) {
        link = array[3];
    } else {
        link = array[0];
    }

    const response = await fetch(`https://cors.securebin.workers.dev/?https://pastebin.com/raw/` + link);

    if (!response.ok) {
        const error = await response.text();
        console.log(error);
        return API_ERROR + error;
    }

    const text = await response.text();
    console.log(text);
    return text;
}
