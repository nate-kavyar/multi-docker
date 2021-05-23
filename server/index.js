const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client setup
// console.log("user", keys.pgUser);
// console.log("host", keys.pgHost);
//console.log("database", keys.pgDatabase);
// console.log("password", keys.pgPassword);
// console.log("port", keys.pgPort);

const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on("connect", (client) => {
  //console.log("blah blah blah")
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => {
      //console.error("could not connect to postgres")
      console.error(err)
    });
});

// Redis client setup
const redis = require('redis');

//console.log("redis port", keys.redisPort);
//console.log("redis host", keys.redisHost)
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  //console.log("in get");
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  //console.log("in get pg query");
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
  //res.send('Hi');
});

app.get('/values/current', async (req, res) => {
  console.log("in get current");
  redisClient.hgetall('values', (err,values) => {
    res.send(values);
  });
});

app.post('/values', async (req,res) =>{
  console.log("in get /values");
  const index = req.body.index;
  if(parseInt(index) > 40){
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index );
  pgClient.query('INSERT INTO values(number) values($1)', [index]);

  res.send({working: true});
})

app.listen(5000, err => {
  console.log('Listening');
});