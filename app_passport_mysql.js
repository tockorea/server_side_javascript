var expresss = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require('pbkdf2-password');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'o2'
});
conn.connect();
var app = expresss();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '111111',
    database: 'o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/count', function(req, res) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : ' + req.session.count);
});
app.get('/auth/logout', function(req, res) {
  req.logout();
  req.session.save(function() {
    res.redirect('/welcome');
  });
});
app.get('/welcome', function(req, res) {
  if (req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
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
app.post('/auth/register', function(req, res) {
  hasher({
    password: req.body.password
  }, function(err, pass, salt, hash) {
    var user = {
      authId: 'local:' + req.body.username,
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    var sql = 'INSERT INTO users SET ?';
    conn.query(sql, user, function(err, results) {
      if (err) {
        console.log(err);
        res.status(500).send('Internal Server Errors');
      } else {
        req.login(user, function(err) {
          req.session.save(function() {
            res.redirect('/welcome');
          });
        });
      }
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
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
  console.log('deserialzeUser', id);
  var sql = 'SELECT * FROM users WHERE authId = ?';
  conn.query(sql, [id], function(err, results) {
    if (err) {
      console.log(err);
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM users WHERE authId = ?';
    conn.query(sql, ['local:' + uname], function(err, results) {
      if (err) {
        return done('There is no user.');
      }
      if (results.length > 0) {
        var user = results[0];
        return hasher({
          password: pwd,
          salt: user.salt
        }, function(err, pass, salt, hash) {
          if (hash === user.password) {
            console.log('LocalStrategy', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      } else {
        done(null, false);
      }
    });
  }
));
passport.use(new FacebookStrategy({
    clientID: '앱ID',
    clientSecret: '앱시크릿코드',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'email', 'gender', 'link', 'locale',
      'name', 'timezone', 'updated_time', 'verified', 'displayName'
    ]
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:' + profile.id;
    var sql = 'SELECT * FROM users WHERE authId = ?';
    conn.query(sql, [authId], function(err, results) {
      if (results.length > 0) {
        done(null, results[0]);
      } else {
        var newuser = {
          'authId': authId,
          'displayName': profile.displayName,
          'email': profile.emails[0].value
        };
        sql = 'INSERT INTO users SET ?';
        conn.query(sql, newuser, function(err, results) {
          if (err) {
            console.log(err);
            done('Error');
          } else {
            done(null, newuser);
          }
        });
      }
    });
  }
));
app.post('/auth/login',
  passport.authenticate('local', {
    failureRedirect: '/auth/login',
    failureFlash: false
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.save(function() {
      res.redirect('/welcome');
    });
  }
);
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: 'email'
  })
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.save(function() {
      res.redirect('/welcome');
    });
  }
);
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
  <a href="/auth/facebook">facebook</a>
  `;
  res.send(output);
});
app.listen(3003, function() {
  console.log('Connected 3003 port!!!');
});
