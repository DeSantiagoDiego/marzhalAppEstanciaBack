const express = require('express');
const app = express();
var cors = require('cors');

app.use(express.static(__dirname + '/img'));
app.use(express.urlencoded({ extended: false }));
app.use(cors(3000));
app.use(express.json());

app.use('/api/auth', require('./controllers/authController'));

module.exports = app;