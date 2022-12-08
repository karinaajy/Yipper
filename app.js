/**
 * Name: Jiayi Yang
 * Section: CSE 154 AE
 *
 * The entry point of the yipper server-side node-express app.
 * Handles static files' serving, database connections, API calls from the client side, etc.
 */
'use strict';

const express = require('express');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const LOCAL_PORT = 3002;
const [SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE] = [200,400,500];

const app = express();
const PORT = process.env.PORT || LOCAL_PORT;
const SERVER_ERROR_MESSAGE = 'An error occurred on the server. Try again later.';

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

/** Endpoint 1: Get all yip data or yip data matching a given search term,
 * return all yips or all ids of yips who matches the given search term.
 */
app.get('/yipper/yips', async (req, res) => {
  try {
    let db = await getDBConnection();
    let sqlString = req.query.search ? 
    `SELECT id FROM yips WHERE yip LIKE '%${req.query.search}%' ORDER BY id` :
    `SELECT * FROM yips ORDER BY DATETIME(date) DESC`;
    let rows = await db.all(sqlString);
    await db.close();
    res.type('json').status(SUCCESS_CODE)
    .send({yips: rows});
  } catch (err) {
    res.type('txt').status(SERVER_ERROR_CODE)
    .send(SERVER_ERROR_MESSAGE);
  }
});

/** Endpoint 2: Get yip data for a designated user, return all of this user's yips; */
app.get('/yipper/user/:user', async (req, res) => {
  try {
    let db = await getDBConnection();
    let sqlString = `SELECT name, yip, hashtag, date FROM yips WHERE name = '${req.params.user}' ORDER BY DATETIME(date) DESC`;
    let rows = await db.all(sqlString);
    await db.close();
    if (rows.length === 0) {
      res.type('txt').status(BAD_REQUEST_CODE)
      .send(`Yikes. User does not exist.`);
    } else {
      res.type('json').status(SUCCESS_CODE)
      .send(rows);
    }
  } catch (err) {
    res.type('txt').status(SERVER_ERROR_CODE)
    .send(SERVER_ERROR_MESSAGE);
  }
});

/** Endpoint 3: Update the likes for a designated yip, increase it by one and return current likes; */
app.post('/yipper/likes', async (req, res) => {
  if (!req.body.id) {
    res.type('txt').status(BAD_REQUEST_CODE)
    .send('Missing one or more of the required params.');
  } else {
    try {
      let db = await getDBConnection();
      let sqlString = `SELECT * FROM yips WHERE id = ${req.body.id}`;
      let row = await db.get(sqlString);
      if (!row) {
        await db.close();
        res.type('txt').status(BAD_REQUEST_CODE)
        .send(`Yikes. ID does not exist.`);
      } else {
        let sqlString2 = `UPDATE yips SET likes = ? WHERE id = ?`;
        await db.run(sqlString2, [row.likes + 1, req.body.id]);
        await db.close();
        res
          .type('txt')
          .status(SUCCESS_CODE)
          .send(`${row.likes + 1}`);
      }
    } catch (err) {
      res.type('txt').status(SERVER_ERROR_CODE)
      .send(SERVER_ERROR_MESSAGE);
    }
  }
});

/** Endpoint 4: Post a new yip. Create a new yip, save in database and return the new yip object */
app.post('/yipper/new', async (req, res) => {
  let {name, full} = req.body || {};
  let [yip, hashtag] = full ? [...full.split(' #')] : [];
  if (!(name && yip && hashtag)) {
    res.type('txt').status(BAD_REQUEST_CODE)
    .send('Missing one or more of the required params.');
  } else {
    try {
      let db = await getDBConnection();
      let sqlString = `SELECT id FROM yips WHERE name = '${name}'`;
      let result = await db.get(sqlString);
      if (!result.id) {
        await db.close();
        res.type('txt').status(BAD_REQUEST_CODE)
        .send('Yikes. User does not exist.');
      } else {
        let sqlString2 = `INSERT INTO yips ("name", "yip", "hashtag","likes") VALUES ("${name}", "${yip}", "${hashtag}", 0)`;
        let result2 = await db.run(sqlString2);
        let sqlString3 = `SELECT * FROM yips WHERE id = ${result2.lastID}`;
        let result3 = await db.get(sqlString3);
        res.type('json').status(SUCCESS_CODE)
        .send(result3);
      }
    } catch (err) {
      res.type('txt').status(SERVER_ERROR_CODE)
      .send(SERVER_ERROR_MESSAGE);
    }
  }
});

/** Endpoint: Show the main page */
app.get('*', function(req, res) {
  res.type('html').sendFile(path.join(__dirname, './public/yipper.html'));
});

app.listen(PORT, function() {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
  console.log(`🌎 ==> http://localhost:${PORT}`);
});

/**
 * Helper function: Return a promise to connect to sqlite database.
 * @returns {Promise} db - The promise of splite database connection.
 */
async function getDBConnection() {
  const db = await open({
    filename: 'yipper.db',
    driver: sqlite3.Database,
  });
  return db;
}