const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  //connectionString: process.env.DATABASE_URL,
  connectionString: "postgres://udc9cc48v6715g:p2eb233a21695a433429a5df26e76ee06f2562f1e8408e8c695a6384f0c49f3c2@ec2-3-213-28-16.compute-1.amazonaws.com:5432/dbk5e5h1rui4i4",
  ssl: { rejectUnauthorized: false },
});


module.exports = {
  query: (text, params) => pool.query(text, params),
};
