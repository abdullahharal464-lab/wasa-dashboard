const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'database.json');

// Find local IP address automatically to share with laptops
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIp();

// Create the database JSON file if it doesn't exist yet
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    registeredUsers: [],
    complaints: [
      { id: 1, category: 'Water Leakage', name: 'Ahmad Khan', phone: '03001234567', location: 'Main Street, Block A', status: 'Remaining', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
      { id: 2, category: 'Sewerage Overflow', name: 'Sara Ali', phone: '03339876543', location: 'Main Road, Block C', status: 'Resolved', timestamp: new Date(Date.now() - 172800000).toLocaleString() }
    ]
  }, null, 2));
}

const server = http.createServer((req, res) => {
  // Allow all laptops to access without security block
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve the HTML file
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } 
  // Send data to devices
  else if (req.method === 'GET' && req.url === '/api/data') {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } 
  // Save new data from devices
  else if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const newData = JSON.parse(body);
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } 
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n====================================================');
  console.log(' 🟢 WASA DASHBOARD SERVER IS RUNNING!');
  console.log('====================================================');
  console.log(`\n 💻 Access on THIS computer:`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`\n 📡 Access for OTHER Laptops on your Wi-Fi:`);
  console.log(`    http://${LOCAL_IP}:${PORT}`);
  console.log('\n====================================================');
  console.log(' ⚠️ Keep this black window open to keep syncing data!');
  console.log('====================================================\n');
});
