import { WebSocket, WebSocketServer } from "ws";
import type { Server as HttpServer } from "http";
import type { ViteDevServer, PreviewServer } from "vite";


export default class QuotouflageServer {
    websocketServer : WebSocketServer;

    constructor(server : ViteDevServer|PreviewServer, isDevelopment : boolean) {
        this.websocketServer = new WebSocketServer({
            server: !isDevelopment ? <HttpServer>server.httpServer : undefined,
            port: isDevelopment ? 4832 : undefined
        })

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