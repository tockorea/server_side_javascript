var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'o2'
});
conn.connect();
// var sql = 'SELECT * FROM topic';
// conn.query(sql, function(err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     for (var i = 0; i < rows.length; i++) {
//       console.log(rows[i].title);
//     }
//   }
// });
// var sql = 'INSERT INTO topic(title, description, author) VALUES(?, ?, ?)';
// var params = ['Nodejs', 'Server side JavaScript', 'duru'];
// conn.query(sql, params, function(err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows.insertId);
//   }
// });
// var sql = 'UPDATE topic SET title = ?, description = ?, author = ? WHERE id = ?';
// var params = ['NodeJS', 'Server Side JavaScript', 'duru', 3];
// conn.query(sql, params, function(err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows);
//   }
// });
var sql = 'DELETE FROM topic WHERE id = ?';
var params = [3];
conn.query(sql, params, function(err, rows, fields) {
  if (err) {
    console.log(err);
  } else {
    console.log(rows);
  }
});
conn.end();
