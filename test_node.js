import http from 'http';
import fs from 'fs';

const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Node is working on this server!\nNode Version: ' + process.version + '\nTime: ' + new Date().toISOString());
});

server.listen(port, '0.0.0.0', () => {
  console.log('Test server running on port', port);
  fs.writeFileSync('node_test_success.log', 'Node test success at ' + new Date().toISOString());
});
