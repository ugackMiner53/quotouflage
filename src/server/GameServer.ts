import { WebSocket, WebSocketServer } from "ws";


export default class GameServer {
    websocketServer : WebSocketServer;

    constructor(port: number) {
        this.websocketServer = new WebSocketServer({port})
        this.websocketServer.on("connection", this.handleSocket);
    }

    // Gameplay Variables
    rooms : Room[] = [];

    handleSocket(socket : WebSocket) {
        console.log("Someone joined!");

        socket.on("message", (msg) => {
            console.log("I got " + msg);
            socket.send("I recieved " + msg);
        })
    }

    reset() {
        this.rooms = [];
        this.websocketServer.clients.forEach(socket => {
            socket.close();
        })
    }
}




class Room {
    host : WebSocket;
    code : string;
    players : WebSocket[] = [];

    constructor(host : WebSocket, code : string) {
        this.host = host;
        this.code = code;
    }

    sendToAll(data : any) {
        for (const player of this.players) {
            player.send(data);
        }
    }

    sendToOthers(data : any) {

    }
}