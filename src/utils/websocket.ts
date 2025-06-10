import { SensorData, WebSocketState } from '../types';
import { WEBSOCKET_RECONNECT_INTERVAL, MAX_RECONNECTION_ATTEMPTS, URL_VALIDATION } from '../constants/config';

export interface WebSocketManager {
  connect: (url: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  send: (data: any) => void;
  getState: () => WebSocketState;
}

export class WebSocketManagerImpl implements WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private state: WebSocketState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessageTime: null,
    reconnectAttempts: 0,
  };
  private onStateChange: ((state: WebSocketState) => void) | null = null;
  private onData: ((data: SensorData) => void) | null = null;

  constructor(
    onStateChange?: (state: WebSocketState) => void,
    onData?: (data: SensorData) => void
  ) {
    this.onStateChange = onStateChange || null;
    this.onData = onData || null;
  }

  private validateUrl(url: string): boolean {
    if (!url.startsWith(URL_VALIDATION.PROTOCOL)) {
      throw new Error('WebSocket URL must start with ws://');
    }
    if (url.length > URL_VALIDATION.MAX_LENGTH) {
      throw new Error('WebSocket URL is too long');
    }
    if (!URL_VALIDATION.PATTERN.test(url)) {
      throw new Error('Invalid WebSocket URL format');
    }
    return true;
  }

  private updateState(newState: Partial<WebSocketState>) {
    this.state = { ...this.state, ...newState };
    this.onStateChange?.(this.state);
  }

  private validateSensorData(data: any): data is SensorData {
    if (!data || typeof data !== 'object') return false;
    
    const hasAccelerometer = data.accelerometer && 
      typeof data.accelerometer.x === 'number' &&
      typeof data.accelerometer.y === 'number' &&
      typeof data.accelerometer.z === 'number';
    
    const hasGyroscope = data.gyroscope &&
      typeof data.gyroscope.x === 'number' &&
      typeof data.gyroscope.y === 'number' &&
      typeof data.gyroscope.z === 'number';
    
    const hasValidTimestamp = !data.timestamp || typeof data.timestamp === 'number';
    
    return hasAccelerometer && hasGyroscope && hasValidTimestamp;
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (this.validateSensorData(data)) {
        const sensorData = {
          ...data,
          timestamp: data.timestamp || Date.now()
        };
        this.onData?.(sensorData);
        this.updateState({ lastMessageTime: Date.now() });
      } else {
        console.warn('Received invalid sensor data format:', data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.updateState({ error: 'Invalid message format' });
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    this.updateState({ 
      error: 'Connection error occurred',
      isConnected: false,
      isConnecting: false
    });
    this.attemptReconnect();
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket closed:', event.code, event.reason);
    this.updateState({ 
      isConnected: false,
      isConnecting: false,
      error: event.reason || 'Connection closed'
    });
    this.attemptReconnect();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      this.updateState({ 
        error: 'Maximum reconnection attempts reached',
        reconnectAttempts: this.reconnectAttempts
      });
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const backoffTime = Math.min(
      WEBSOCKET_RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.updateState({ reconnectAttempts: this.reconnectAttempts });
      if (this.ws?.url) {
        this.connect(this.ws.url);
      }
    }, backoffTime);
  }

  public connect(url: string) {
    try {
      this.validateUrl(url);
      
      // Close existing connection if any
      this.disconnect();
      
      this.updateState({ 
        isConnecting: true,
        error: null,
        reconnectAttempts: 0
      });

      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        this.updateState({ 
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        });
      };

      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.updateState({ 
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect'
      });
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastMessageTime: null,
      reconnectAttempts: 0
    });
  }

  public reconnect() {
    if (this.ws?.url) {
      this.connect(this.ws.url);
    }
  }

  public send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('Cannot send data: WebSocket is not connected');
    }
  }

  public getState(): WebSocketState {
    return { ...this.state };
  }
} 