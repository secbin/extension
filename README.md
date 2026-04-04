# securebin

<a href="https://chrome.google.com/webstore/detail/securebin/ehjclckbpmkgjgfnebopjlilpdbjjpjj" target="_blank" rel="noreferrer noopener"><img width="50" src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Chrome_Web_Store_logo_2012-2015.svg"></a>

securebin is a Google Chrome extension for interfacing securely with PasteBin.

Users can encrypt plaintext and have it stored onto PasteBin, where they can copy the link and key to send it to another user for decryption.

First, users will need to get a API key from PasteBin to be able to post onto [PasteBin.](https://pastebin.com/doc_api#1)

Once the API key is added to the extension in the settings page, users can post their messages securely to PasteBin.

To learn more about our project and the design decisions check out the [Wiki page.](https://github.com/fairhurt/securebin/wiki)

<img width="300" src="assets/video/demo.gif" alt="Encryption Prompt screen">

## 2. How to Install this extension:

You can grab a prebuild version of this extention under the release tab or build it yourself

To Build

```
$ yarn
$ yarn upgrade
$ yarn run build
```
