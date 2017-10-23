const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plan');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`sever running at http://${hostname}:${port}/`);
});
