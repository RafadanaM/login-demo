const { Pool } = require("pg");

//database
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "authenticationDemo",
  password: "Rafadana22",
  port: 5432,
});

pool.connect(function (err, client, release) {
  if (err) {
    throw err;
  }

  //CREATE USER TABLE
  const createUserTable = `CREATE TABLE IF NOT EXISTS USERS(id_user SERIAL not null primary key, username varchar(50) not null UNIQUE, password varchar(255) not null, role varchar(50), refresh_token varchar(255));`;
  client.query(createUserTable, function (error, results, fields) {
    release();
    if (error) {
      throw error;
    }
  });
});

module.exports = pool;
