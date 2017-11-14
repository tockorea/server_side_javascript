module.exports = function(passport) {
  var bkfd2Password = require('pbkdf2-password');
  var hasher = bkfd2Password();
  var conn = require('../../config/mysql/db')();
  var route = require('express').Router();
  route.post('/login',
    passport.authenticate('local', {
      failureRedirect: '/auth/login',
      failureFlash: false
    }),
    function(req, res) {
      // Successful authentication, redirect home.
      req.session.save(function() {
        res.redirect('/topic');
      });
    }
  );
  route.get('/login', function(req, res) {
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields) {
      res.render('auth/login', {
        topics: topics
      });
    });
  });
  route.get('/facebook',
    passport.authenticate('facebook', {
      scope: 'email'
    })
  );
  route.get('/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/auth/login'
    }),
    function(req, res) {
      // Successful authentication, redirect home.
      req.session.save(function() {
        res.redirect('/topic');
      });
    }
  );
  route.post('/register', function(req, res) {
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
              res.redirect('/topic');
            });
          });
        }
      });
    });
  });
  route.get('/register', function(req, res) {
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields) {
      res.render('auth/register', {
        topics: topics
      });
    });
  });
  route.get('/logout', function(req, res) {
    req.logout();
    req.session.save(function() {
      res.redirect('/topic');
    });
  });
  return route;
};
