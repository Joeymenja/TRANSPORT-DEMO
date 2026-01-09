import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for demo purposes
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(room);
        // console.log(`Client ${client.id} joined room: ${room}`);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() room: string,
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(room);
    }

    @SubscribeMessage('update_location')
    handleUpdateLocation(
        @MessageBody() data: { driverId: string; lat: number; lng: number; status: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Broadcast to 'admin' room
        this.server.to('admin').emit('driver_location_updated', data);
        
        // Also echo back to the driver if needed, or just ack?
        // For now, just broadcast to admins.
    }
}
