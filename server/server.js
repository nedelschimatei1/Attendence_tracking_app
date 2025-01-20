import express from 'express'
import cors from 'cors'
import sequelize from './database/database.js';
import authRoutes from './routes/auth.js';
import protectedRoute from './routes/protectedRoute.js'
import http from 'http';
import { WebSocketServer } from 'ws';
import eventGroupRoutes from './routes/eventGroupRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import './middleware/eventScheduler.js';

const app = express()
let port = 8080

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
  
    ws.on('error', console.error);
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

const corsOptions={
    whiteList: "http://localhost:5173",
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.set('wss', wss);

try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
} catch (error) {
console.error('Error syncing database:', error);
}

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verifyUserIntegrity', protectedRoute);
app.use('/api/eventGroups', eventGroupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participations', participationRoutes);


app.listen(port,()=>{
    console.log("Server started on port: 8080")
})