var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('<h1>Welcom to homepage</h1>');
});

app.get('/login', function(req, res) {
  res.send('<h1>Login please</h1>');
});

app.listen(3000, function() {
  console.log('Connected 3000 port!');
});