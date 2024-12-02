import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversionDto } from './dto/conversion.dto';
import * as WebSocket from 'ws';

@WebSocketGateway({ namespace: 'conversion' })
export class ConversionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private wsConnections: Map<string, { ws: WebSocket; pingInterval: NodeJS.Timeout }> = new Map();

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Clean up WebSocket connection and interval if they exist
    const connection = this.wsConnections.get(client.id);
    if (connection) {
      clearInterval(connection.pingInterval);
      connection.ws.close();
      this.wsConnections.delete(client.id);
    }
  }

  @SubscribeMessage('wstoio')
  handleConversion(
    @MessageBody() conversion: ConversionDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(conversion);
    const wsUrl = `wss://api.paletteapp.xyz/ws/${conversion.roomId}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'x-auth-token': conversion.token,
      },
    });

    ws.on('open', () => {
      console.log('WebSocket connection opened');

      // Set up ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
          console.log('Ping sent to WebSocket server');
        }
      }, 60000); // 60000ms = 1 minute

      // Store the WebSocket connection and interval
      this.wsConnections.set(client.id, { ws, pingInterval });
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        console.log(parsedData);
        client.emit('message', parsedData);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      client.emit('error', { message: 'An error occurred during conversion' });
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Clean up interval when connection closes
      const connection = this.wsConnections.get(client.id);
      if (connection) {
        clearInterval(connection.pingInterval);
        this.wsConnections.delete(client.id);
      }
    });

    // Add pong listener to confirm ping responses
    ws.on('pong', () => {
      console.log('Received pong from WebSocket server');
    });
  }
}
