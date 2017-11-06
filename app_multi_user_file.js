var expresss = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var app = expresss();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
app.get('/count', function(req, res) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : ' + req.session.count);
});
app.get('/auth/logout', function(req, res) {
  delete req.session.displayName;
  req.session.save(function() {
    res.redirect('/welcome');
  });
});
app.get('/welcome', function(req, res) {
  if (req.session.displayName) {
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});
var users = [{
  username: 'egoing',
  password: 'I1FKck4VadO2t+F4YPAQ2pd5B/JZZ173jGNPz7o3s7GbjwiEy0aEZs9PIlbWLyw1hLPeUGHUeWNtePWgavmqzLh92sn0dI/CpvEP6Zy0OzriquS9h0QsADQ8PfcXk0NR3SZlmn8Tf+UiAx2BkGjhPJPrEd+eQEfR1oJrJrp+mnU=',
  salt: '4icJmZgrdssyiB1UpAZy2mpf4cJgXsWhM+X0dN9WYb2SYrXLoP3WAQIPjRPyAkNbqTH1+FLhAs5ya9MmfvitYg==',
  displayName: 'Egoing'
}];
app.post('/auth/register', function(req, res) {
  hasher({
    password: req.body.password
  }, function(err, pass, salt, hash) {
    var user = {
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(function() {
      res.redirect('/welcome');
    });
  });
});
app.get('/auth/register', function(req, res) {
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
app.post('/auth/login', function(req, res) {
  var uname = req.body.username;
  var pwd = req.body.password;
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (uname === user.username) {
      return hasher({
        password: pwd,
        salt: user.salt
      }, function(err, pass, salt, hash) {
        if (hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save(function() {
            res.redirect('/welcome');
          });
        } else {
          res.send('Who are you? <a href="/auth/login">login</a>');
        }
      });
    }
  }
});
app.get('/auth/login', function(req, res) {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
app.listen(3003, function() {
  console.log('Connected 3003 port!!!');
});
