import WebSocket from 'ws';

interface ClientData {
  ws: WebSocket;
  id: string;
}

class WebSocketService {
  private static clients: ClientData[] = [];

  // Add a new client to the list
  public static addClient(ws: WebSocket, id: string) {
    WebSocketService.clients.push({ ws, id });
    console.log(`Client ${id} added`);
  }

  // Remove a client from the list
  public static removeClient(ws: WebSocket) {
    const index = WebSocketService.clients.findIndex(client => client.ws === ws);
    if (index !== -1) {
      WebSocketService.clients.splice(index, 1);
      console.log('Client removed');
    }
  }

  // Check if a client is already connected
  public static isClientConnected(id: string): boolean {
    return WebSocketService.clients.some(client => client.id === id);
  }

  // Send data to a specific client by ID
  public static sendToClient(id: string, data: any) {
    const client = WebSocketService.clients.find(client => client.id == id);
 
    if (client) {
      client.ws.send(JSON.stringify(data));
      console.log(`Sent data to client ${id}:`, data);
    } else {
      console.log(`Client ${id} not found`);
    }
  }

  // Send data to all connected clients
  public static sendToAllClients(data: any) {
    WebSocketService.clients.forEach(client => {
      client.ws.send(JSON.stringify(data));
    });
    console.log('Sent data to all clients:', data);
  }
}

export default WebSocketService;
