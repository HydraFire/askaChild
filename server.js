const express = require('express');
const bodyParser = require('body-parser');
const { getFromAska, startWork } = require('./webScrapingCircle');
const { rout } = require('./route');
const app = express();
const port = 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', rout);

app.listen(port, () => {
   console.log('running on port:' + port)
});

getFromAska().then(startWork);
