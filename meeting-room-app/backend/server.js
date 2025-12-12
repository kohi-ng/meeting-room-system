const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const roomsFile = path.join(dataDir, 'rooms.json');
const meetingsFile = path.join(dataDir, 'meetings.json');
const usersFile = path.join(dataDir, 'users.json');

function readJSON(file, def){
  try{ return JSON.parse(fs.readFileSync(file)); }catch(e){ return def; }
}
function writeJSON(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

// seed rooms if empty
function generateRooms(){
  const featuresList = ["Whiteboard","Projector","Television","Touchable board","Video conferencing","Conference phone","HDMI","Microphone"];
  const rooms = [];
  function addRange(prefix, start, end, floor){
    for(let i=start;i<=end;i++){
      const id = `${prefix}${i}`;
      const name = `Phòng ${id}`;
      const capacity = 6 + (i % 10);
      const features = [];
      const a = featuresList[i % featuresList.length];
      const b = featuresList[(i+3) % featuresList.length];
      features.push(a,b);
      rooms.push({ id, name, capacity, location:`Tòa nhà ${prefix} - Tầng ${floor}`, features });
    }
  }
  addRange('A', 101, 150, 1);
  addRange('A', 201, 250, 2);
  addRange('B', 101, 150, 1);
  addRange('B', 201, 250, 2);
  return rooms;
}

// ensure data dir exists
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive:true });

// ensure rooms seeded
let rooms = readJSON(roomsFile, []);
if(!rooms || rooms.length===0){
  rooms = generateRooms();
  writeJSON(roomsFile, rooms);
  console.log('Seeded', rooms.length, 'rooms');
}

// static frontend
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// API
app.get('/api/rooms', (req, res)=>{
  const rooms = readJSON(roomsFile, []);
  res.json(rooms);
});

app.get('/api/meetings', (req,res)=>{
  const meetings = readJSON(meetingsFile, []);
  res.json(meetings);
});

app.post('/api/meetings', (req,res)=>{
  const meetings = readJSON(meetingsFile, []);
  const meeting = req.body;
  meeting.id = Date.now();
  meetings.push(meeting);
  writeJSON(meetingsFile, meetings);
  return res.json({ message: 'Meeting saved', meeting });
});

app.post('/api/register', (req,res)=>{
  const {email,password} = req.body;
  const users = readJSON(usersFile, []);
  if(users.find(u=>u.email===email)) return res.json({ message: 'Already exists' });
  users.push({ id: Date.now(), email, password });
  writeJSON(usersFile, users);
  return res.json({ message: 'Registered' });
});

app.post('/api/login', (req,res)=>{
  const {email,password} = req.body;
  const users = readJSON(usersFile, []);
  const u = users.find(x=>x.email===email && x.password===password);
  if(!u) return res.json({ message: 'Invalid credentials' });
  // demo token (not secure)
  return res.json({ token: 'demo-token', email });
});

// health
app.get('/api/health', (req,res)=>res.json({ ok:true }));

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('Server started on', port));
