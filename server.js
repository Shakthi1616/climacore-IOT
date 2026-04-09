const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// ===== Storage =====
let latestData = {};
let history = [];
const MAX_HISTORY = 50;

// ===== POST =====
app.post('/api/data', (req, res) => {
  const { temperature, humidity, pressure, air, rain } = req.body;

  if (
    temperature === undefined ||
    humidity === undefined ||
    pressure === undefined ||
    air === undefined ||
    rain === undefined
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const data = {
    temperature: Number(temperature),
    humidity: Number(humidity),
    pressure: Number(pressure),
    air: Number(air),
    rain: Number(rain),
    time: new Date().toLocaleTimeString()
  };

  latestData = data;

  history.push(data);
  if (history.length > MAX_HISTORY) history.shift();

  console.log("📡 Received:", data);

  res.json({ status: "OK" });
});

// ===== GET =====
app.get('/api/data', (req, res) => {
  res.json(latestData);
});

app.get('/api/history', (req, res) => {
  res.json(history);
});

app.get('/api/status', (req, res) => {
  res.json({
    connected: latestData.time ? true : false,
    time: new Date()
  });
});

// ===== Root =====
app.get('/', (req, res) => {
  res.send("ClimaCore Backend Running ✅");
});

// ===== IP =====
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i of interfaces[iface]) {
      if (i.family === 'IPv4' && !i.internal) {
        return i.address;
      }
    }
  }
  return '127.0.0.1';
}

const PORT = 3000;
const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 ClimaCore Backend Running");
  console.log(`👉 Local: http://localhost:${PORT}`);
  console.log(`👉 Network: http://${localIP}:${PORT}`);
});