const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://abdullahharal464_db_user:crW4SNVCRZmzyJLI@cluster0.rjsssbs.mongodb.net/?appName=Cluster0";

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

// Global variable for Mongo connection
let dbCollection = null;

// Connect to MongoDB once
async function connectToMongo() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('wasa_app');
    dbCollection = db.collection('store');
    console.log('🔗 Connected to MongoDB Cloud Database Successfully!');
    
    // Initialize data if database is completely empty
    const existing = await dbCollection.findOne({ _id: 'main_data' });
    if (!existing) {
      await dbCollection.insertOne({
        _id: 'main_data',
        registeredUsers: [],
        complaints: [
          { id: 1, category: 'Water Leakage', name: 'Ahmad Khan', phone: '03001234567', location: 'Main Street, Block A', status: 'Remaining', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
          { id: 2, category: 'Sewerage Overflow', name: 'Sara Ali', phone: '03339876543', location: 'Main Road, Block C', status: 'Resolved', timestamp: new Date(Date.now() - 172800000).toLocaleString() }
        ]
      });
      console.log('🆕 Initialized new MongoDB database with dummy data.');
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
}

connectToMongo();

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
  // Send data to devices FROM MONGODB
  else if (req.method === 'GET' && req.url === '/api/data') {
    if (!dbCollection) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Database not connected yet' }));
    }
    
    dbCollection.findOne({ _id: 'main_data' }).then(data => {
      // Remove _id for the frontend
      if (data) delete data._id;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data || { registeredUsers: [], complaints: [] }));
    }).catch(err => {
      res.writeHead(500);
      res.end('Server Error fetching data');
    });
  } 
  // Save new data from devices TO MONGODB
  else if (req.method === 'POST' && req.url === '/api/data') {
    if (!dbCollection) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Database not connected yet' }));
    }

    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const newData = JSON.parse(body);
        
        // Save to MongoDB replacing the old document completely
        dbCollection.updateOne(
          { _id: 'main_data' },
          { $set: { registeredUsers: newData.registeredUsers || [], complaints: newData.complaints || [] } },
          { upsert: true }
        ).then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        }).catch(err => {
          res.writeHead(500);
          res.end('Database save error');
        });
        
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
  console.log(' 🟢 WASA DASHBOARD SERVER IS RUNNING (CLOUD READY)!');
  console.log('====================================================');
  console.log(`\n 💻 Access on THIS computer:`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`\n 📡 Access for OTHER Laptops on your Wi-Fi:`);
  console.log(`    http://${LOCAL_IP}:${PORT}`);
  console.log('\n====================================================');
  console.log(' ⚠️ Data is now LIVE in MongoDB Atlas Cloud!');
  console.log('====================================================\n');
});
