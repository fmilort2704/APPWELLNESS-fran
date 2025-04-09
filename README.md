# GDP15ActivePoints

A GDP project submitted for the award of MEng Computer Science at the University of Southampton.

## Description

A web-based dashboard that allows clinicians to view data on their patients. The dashboard is highly customisable both via the customer and the clinicians, with customers customising what data the clinicians have access to and the clinicians customising how they can view said data. The dashboard also features an AI-Module that allows clinicians to “sort, forecast and recommend” data and possible future procedures.

To run the project locally:

- run `python apiInterface.py` from backend/ai-module/src/api to start the flask AI API
- run `npm start` from backend/server to run the ExpressJs API
- run `npm start` from frontend/ to run the React App
  (Remember to `npm install` to collect the modules and follow the additional .md files for more detailed guidance)
- configure environment variables to allow authentication via the postgres database

**Project completed by:**<br>
Rory Coulson (rc3g20)<br>
Dillon Geary (dgfg1g20)<br>
Neeraja Jayaraj Menon (njm1g20)<br>
Joseph Padden (jp3g20)

**Under the supervision of:**<br>
Adriane Chapman (ac1n16)

**For the client:**<br>
Niall Jordan (Active Points CEO)
