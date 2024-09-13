import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
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

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
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
    });
  }
}
