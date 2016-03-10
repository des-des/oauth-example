
# OAuth2 - Walkthrough Example

**Obective get access token from Github to authenticate user**

## Register Your App
**Third party service providers (e.g. Facebook, Github, Google ....).**
 
- Visit their GUI developer console OAuth section, register your app, provide them with your redirect URI or Authorisation callback URL (Once your user is authenticated this will be the url of your server with the desired endpoint).

- They will provide you with a Client ID and Client_Secret, add these along with your redirect URI (could call it BASE_URL) to your environment variables. 

*Remember to add your .env file to your gitignore so it's not pushed to github*

## GitHub OAuth Step By Step process.
**This is what happens the first time a user trys to login through a third party.**

### Step 1.
Client lands on page and clicks Github login. The server redirects the user to github and supplies the following inforamation: 
- CLIENT_ID , 
- The BASE_URL / redirect URI and a parameter of our choice('/welcome').
- scope ( if not provided github defaults to public permissions).
  This is sent as a query string after https://github.com/login/oauth/authorize?.

### Step 2.
Github recieves this, validates the endpoint and asks the user to allow     access to the provided scope. Let's assume the client clicks 'allow'.

### Step 3.
Github will then use the URI redirect previously provided to send back an **authorisation code** to the apps server using endpoint provided including the code in the URL.*the code is temporary and can only be used once*

### Step 4.
The apps server now makes a POST request to Github for the *access token*. Supplying the query string in the *body* of the request. It needs the following: 
- CLIENT_ID
- CLIENT_SECRET
- code

This is sent to the following endpoint: https://github.com/login/oauth/access_token'. *headers must be set to accpet JSON if this is what you want in your response also indicate what the content length of the body will be*

### Step 5.

Github validates the credentials provided and sends back an *access token* in an JSON object. 

### Step 6 

Using Hapi.js Inert function we reply to the client with index.htnl file and set the parsed accesstoken as a cookie by using state.

### Step 7 

The user clicks the get Data button on the front end which sends a request to Github for public information of the user, the access token is included in the header of the request. 

### Step 8

Github returns an object with the users details which can be viewed in the console. 

## Modules Used 

- [querystring.stringify](https://nodejs.org/api/querystring.html) Converts an object into a endcodedURICompenent.
- [https](https://nodejs.org/api/https.html) HTTPS is the HTTP protocol over TLS/SSL
- [env2](https://github.com/dwyl/env2) environment variable loader.
- [nock](https://docs.omniref.com/js/npm/nock/0.10.7) Nock is an HTTP mocking and expectations library for Node.js. Used for testing HTTP requests. 
- [shot](https://github.com/hapijs/shot) Injects a fake HTTP request/response into a node HTTP server for simulating server logic, writing tests, or debugging. 







    
