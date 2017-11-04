var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: _storage
});
var fs = require('fs');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'o2'
});
conn.connect();
var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/user', express.static('uploads'));
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'jade');
app.get('/upload', function(req, res) {
  res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req, res) {
  console.log(req.file);
  res.send('Uploaded : ' + req.file.filename);
});
app.get('/topic/add', function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Errors');
    }
    res.render('add', {
      topics: topics
    });
  });
});
app.post('/topic/add', function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var sql = 'INSERT INTO topic(title, description, author) values(?, ?, ?)';
  conn.query(sql, [title, description, author], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Errors');
    } else {
      res.redirect('/topic/' + result.insertId);
    }
  });
});
app.get(['/topic/:id/edit'], function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields) {
    var id = req.params.id;
    if (id) {
      var sql = 'SELECT * FROM topic WHERE id = ?';
      conn.query(sql, [id], function(err, topic, fields) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Errors');
        } else {
          res.render('edit', {
            topics: topics,
            topic: topic[0]
          });
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Errors');
    }
  });
});
app.post(['/topic/:id/edit'], function(req, res) {
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var id = req.params.id;
  var sql = 'UPDATE topic SET title = ?, description = ?, author = ? WHERE id = ?';
  conn.query(sql, [title, description, author, id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Errors');
    } else {
      res.redirect('/topic/' + id);
    }
  });
});
app.get(['/topic/:id/delete'], function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields) {
    var id = req.params.id;
    if (id) {
      var sql = 'SELECT * FROM topic WHERE id = ?';
      conn.query(sql, [id], function(err, topic, fields) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Errors');
        } else {
          if (topic.length === 0) {
            console.log('There is no record.');
            res.status(500).send('Internal Server Errors');
          } else {
            res.render('delete', {
              topics: topics,
              topic: topic[0]
            });
          }
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Errors');
    }
  });
});
app.post(['/topic/:id/delete'], function(req, res) {
  var id = req.params.id;
  var sql = 'DELETE FROM topic WHERE id = ?';
  conn.query(sql, [id], function(err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Errors');
    } else {
      res.redirect('/topic/');
    }
  });
});
app.get(['/topic', '/topic/:id'], function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields) {
    var id = req.params.id;
    if (id) {
      var sql = 'SELECT * FROM topic WHERE id = ?';
      conn.query(sql, [id], function(err, topic, fields) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Errors');
        } else {
          res.render('view', {
            topics: topics,
            topic: topic[0]
          });
        }
      });
    } else {
      res.render('view', {
        topics: topics
      });
    }
  });
});
app.listen(3000, function() {
  console.log('Connected, 3000 port');
});
