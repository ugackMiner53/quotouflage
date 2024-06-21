import type NetworkManager from "./NetworkManager";

export default class WebsocketManager implements NetworkManager {
    websocket? : WebSocket;
    
    async connectToWebsocket(url? : string) : Promise<boolean> {
        if (!url) {
            url = `${location.protocol.includes("s") ? "wss" : "ws"}://${location.host}`
        }
        this.websocket = new WebSocket(url)
        
        return new Promise((resolve) => {
            this.websocket!.onopen = () => resolve(true);
            this.websocket!.onerror = () => resolve(false);
        })
    }

    sendWebsocketMessage(object : unknown) {
        const string = JSON.stringify(object);
        this.websocket?.send(string);
    }

    handleWebsocketMessage(messageStr : string) {
        const message = JSON.parse(messageStr);
        
    }

    createNewRoom() : string {
        // Generate new room code
        const code = crypto.randomUUID().substring(0, 7).toUpperCase()
        // this.websocket?.send()
        // if (Object.keys(this.roomConnection.getPeers()).length >= 1) {
        //     console.warn(`Code ${code} was already in use! Regenerating...`);
        //     this.roomConnection.leave();
        //     return this.createNewRoom();
        // } else {
        //     console.log(`Successfully created room ${code}`);
        //     return code;
        // }
    }
    
    
    connectToRoom(code: string): void {
        // this.roomConnection = joinRoom({appId: APP_ID}, code);
        // if (Object.keys(this.roomConnection.getPeers()).length < 1) {
        //     console.warn(`Code ${code} is not a valid code!`);
        //     throw "InvalidCodeException";
        // } else {
        //     console.log(`Successfully connected to ${code}`);
        // }
    }
}