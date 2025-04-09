# NodeJS, ExpressJS App API

- `npm install` to install dependencies for express
- Update `server.js` to change the connection communication between the postgres database and the react app
- Update `db.js` to update postgres database connection configurations
- Current `server.js` is setup so the webapp will show updated database data when the clinician views the patient select screen
  - via the `fetchAPData` function, call this function whenever you want to reupdate the data shown
