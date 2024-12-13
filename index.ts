/* eslint-disable no-console */
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8008 });

console.log('Running server on:', wss.address());

const IPC_NAMESPACE: string = 'urn:x-cast:com.google.cast';

const processInternalMessage = (data: Record<string, any>) => {
  // we mark messages sent internally with an `internalMessage` flag,
  // only these messages will be broadcasted to all of the clients
  const { internalMessage, ...rest } = data;
  if (internalMessage) {
    return rest;
  }
  return data;
};

const broadcastMessage = (ws: WebSocket, data: Record<string, any>) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws: WebSocket) => {
  console.log('connected to wss');

  ws.on('message', (message: string) => {
    const { namespace, data } = JSON.parse(message);
    console.log('------------------------------');
    console.log('received message', namespace, data);
    if (namespace === IPC_NAMESPACE) {
    } else {
      setTimeout(() => {
        broadcastMessage(ws, processInternalMessage(data));
      });
    }
  });
});

wss.on('close', () => {
  console.log('closed wss');
});
