# reactUseGapi
[![NPM](https://img.shields.io/npm/v/@use-gapi/react.svg?&color=green)](https://www.npmjs.com/package/@use-gapi/react)

Lignweight `4.1kb`, simple yet powerful react hook to work with google api/auth.
## Install
```bash
yarn add @use-gapi/react
```

## Usage
```javascript
import useGapi from '@use-gapi/react';

function Login() {
  const { signIn } = useGapi({
    apiKey: "YOUR_API_KEY",
    clientId: "YOUR_CLIENTID",
  })
  return (
    <>
     <button onClick={signIn}>Google Login button</button>
    </>
  )
}
```
## API
| Name              | Type    | Default                              | Description                                                                                                     |
| ----------------- | ------- | --------------------                 | --------------------------------------------------------------------------------------------------------------- |
| apiKey            | String  | ---                                  | **Required**. The apiKey generated in Google's developer console.                                               |
| clientId          | String  | ---                                  | **Required**. The clientID generated in Google's developer console.                                             |
| discoveryDocs     | String  | ''                                   | Docs describes the surface of the API, how to access the API and how API requests and responses are structured. |
| scope             | String  | 'profile openid email'               | Scopes that you might need to request to access Google APIs.                                                    |
| cookiePolicy      | String  | 'single_host_origin'                 | List of domains to create sign-in cookies. Possible: URI, `single_host_origin`, `none`.                         |
| script_url        | String  | 'https://apis.google.com/js/api.js'  | **Required**. Google script that must be added to the DOM; object - `window.gapi`.                              |

## Destructuring
```javascript
const { signIn, signOut, isSignedIn, profile, client } = useGapi();
```
### signIn :: () => Object
Can accept argument `options` - see available google options [here](https://developers.google.com/identity/sign-in/web/reference#googleauthsigninoptions). 
Will return user's [profile object](#profile--object) or error.
### signOut :: () => Boolean
Sign out and disconnect.
Will return `false` or error.
### isSignedIn :: Boolean
Falsy value if not signed in.
### profile :: Object
Google user profile object. 
Default state is:
```
...
 auth: {
   tokenObj: undefined,
   tokenId: undefined,
   accessToken: undefined,
   scope: undefined,
   expiresAt: undefined,
 },
 p: {
   googleId: undefined,
   email: undefined,
   fullName: undefined,
   givenName: undefined,
   familyName: undefined,
   imageUrl: undefined,
 }
...
```
```javascript
const { signIn, profile } = useGapi({
   apiKey: "YOUR_API_KEY",
   clientId: "YOUR_CLIENTID",
})
const { p, auth } = profile;

...
console.log(p.email) // exampleuser@gmail.com
console.log(auth.accessToken) // YOUR_TOKEN
...
```
### client :: Object
Client allows you to use any google api including `auth2`, you just need to add correct discoveryDocs, e.g. for google drive you will need something like this:
```javascript
...
const { client } = useGapi({
   apiKey: "YOUR_API_KEY",
   clientId: "YOUR_CLIENTID",
   discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
})
...
```
and then somewhere:
```javascript
...
const driveApiCall = async () => {
  await client.drive.files.list({
    'pageSize': 15,
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {
    let res = response.result.files;
    console.log(res)
  });
}
...
```
