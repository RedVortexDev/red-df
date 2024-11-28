export class WebSocketSender {
    private ws: WebSocket | null;
    private onConnectCallbacks: Set<any>;

    constructor() {
        this.ws = null;
        this.onConnectCallbacks = new Set();
    }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            // If already connected, immediately run callbacks
            this.onConnectCallbacks.forEach(callback => callback());
            return;
        }

        this.ws = new WebSocket('ws://localhost:31375');

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.onConnectCallbacks.forEach(callback => callback());
        };
    }

    onConnect(callback: any) {
        this.onConnectCallbacks.add(callback);
        // Return cleanup function
        return () => this.onConnectCallbacks.delete(callback);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.onConnectCallbacks.clear();
    }

    send(data: string): boolean {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        } /*else { // Consider in the future
            this.connect();
            setTimeout(() => this.send(data), 100);
        }*/
        return false;
    }
}

export const ws = new WebSocketSender();