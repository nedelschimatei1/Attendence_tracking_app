import { WebSocketServer } from 'ws';

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('error', console.error);
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
};

export const broadcastParticipationUpdate = (wss, eventId, groupId) => {
  if (!wss.clients.size) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'PARTICIPATION_UPDATE',
        eventId,
        groupId
      }));
    }
  });
};