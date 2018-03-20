# SSO across App and API

A test to see how an App and an API on different domains can share authorisation when done via Okta.

Contains an [app](/app) and an [api](/api).

Update hosts file:

`127.0.0.1 departures departures-api`

Copy _.env.sample_ as _.env_ and save in the root of the project. This is shared across the API and App. Fill in all the fields.

Install and run each server.

In _app_: `PORT=3000 nodemon index.js`

In _api_: `PORT=3001 nodemon index.js`

Browse to http://departures:3000/

You should be redirected to Okta (or another identity provider if needed).

Once logged in, the "webpage" should be displayed and a request sent to _http://departures:3000/api/secure-data_.

This will trigger a call on the App server to the API (so proxying): _http://departures:3001/secure-data_.
