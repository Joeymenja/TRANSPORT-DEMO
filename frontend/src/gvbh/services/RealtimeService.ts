
export enum SocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING'
}

export type RealtimeEvent = 
  | 'SERVER_NEW_MESSAGE' 
  | 'TRIP_ASSIGNED' 
  | 'TRIP_CANCELED' 
  | 'DEMAND_SURGE' 
  | 'TRAFFIC_ALERT' 
  | 'DRIVER_LOCATION_UPDATE' 
  | 'DRIVER_STATUS_CHANGE'
  | 'TRIP_COMPLETED'
  | 'MEMBER_LOCATION_UPDATE';

type SocketCallback = (data: any) => void;

class RealtimeService {
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private listeners: Record<string, SocketCallback[]> = {};
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.connect();
    this.setupHeartbeat();
  }

  public connect() {
    if (this.status === SocketStatus.CONNECTED || this.status === SocketStatus.CONNECTING) return;
    
    this.status = this.status === SocketStatus.DISCONNECTED ? SocketStatus.CONNECTING : SocketStatus.RECONNECTING;
    this.notifyStatusChange();

    // Simulate reliable WebSocket handshake
    setTimeout(() => {
      this.status = SocketStatus.CONNECTED;
      this.notifyStatusChange();
      this.startSimulatedTraffic();
      console.debug('[Socket] Connected to secure node: dispatch-west-04.gvbh.io');
    }, 1200);
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.status === SocketStatus.CONNECTED) {
        // Simulate PING/PONG
        this.emit('heartbeat', { uptime: performance.now(), latency: Math.floor(Math.random() * 50) });
      }
    }, 30000);
  }

  private notifyStatusChange() {
    window.dispatchEvent(new CustomEvent('socket-status-change', { 
      detail: { status: this.status, timestamp: Date.now() } 
    }));
  }

  public on(event: RealtimeEvent, callback: SocketCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  public emit(event: string, data: any) {
    // In a real implementation: this.ws.send(JSON.stringify({ event, data }));
    if (event === 'DRIVER_LOCATION_UPDATE') {
      // Simulate server-side reaction or echoing to other clients
      // In this app, we just log it to console for debugging
      // console.debug(`[GPS Broadcast] Lat: ${data.lat.toFixed(4)}, Lng: ${data.lng.toFixed(4)}`);
    }
  }

  public trigger(event: RealtimeEvent, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    
    // Logic for browser-level push notifications
    if (event === 'SERVER_NEW_MESSAGE' && document.visibilityState === 'hidden') {
      this.showPushNotification('GVBH Dispatch', data.text);
    }
  }

  private async showPushNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  private startSimulatedTraffic() {
    setInterval(() => {
      if (this.status !== SocketStatus.CONNECTED) return;
      const rand = Math.random();
      
      if (rand > 0.96) {
        this.trigger('SERVER_NEW_MESSAGE', {
          id: `msg_${Date.now()}`,
          senderName: 'Dispatch Node 4',
          text: 'Urgent: Member TRP-1024 has requested front-door assist. Tools required.',
          timestamp: new Date().toLocaleTimeString()
        });
      } else if (rand > 0.94) {
        this.trigger('DEMAND_SURGE', {
          area: 'Scottsdale Medical Center',
          multiplier: '1.5x',
          message: 'High volume. Rapid response requested.'
        });
      } else if (rand > 0.92) {
        this.trigger('TRAFFIC_ALERT', {
          route: 'I-10 Eastbound',
          delay: '12 min',
          reason: 'Accident at 24th St'
        });
      }
    }, 10000);
  }

  public disconnect() {
    this.status = SocketStatus.DISCONNECTED;
    this.notifyStatusChange();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  public getStatus() {
    return this.status;
  }
}

export const realtimeService = new RealtimeService();
