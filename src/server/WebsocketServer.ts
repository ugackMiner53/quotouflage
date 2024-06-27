import type { Plugin, ServerHook } from "vite";
import dotenv from "dotenv";
import { WebSocket, WebSocketServer } from "ws";
import type { Server as HttpServer } from "http";

//#region Vite Plugin Setup & Server Creation

dotenv.config();

let isDevelopment = false;
let websocketServer : WebSocketServer;

export const configureServer : ServerHook = (server) => {
    if (!websocketServer) {
        console.log(`Configurating ${isDevelopment ? "development" : "production"} server on ${isDevelopment ? "port 4832" : "default URL"}!`);

        websocketServer = new WebSocketServer({
            server: !isDevelopment ? <HttpServer>server.httpServer : undefined,
            port: isDevelopment ? 4832 : undefined
        })
    }

    websocketServer.on("connection", handleSocket)
}

export function websocketServerPlugin(_isDevelopment : boolean) : Plugin {
    isDevelopment = _isDevelopment;

    return {
        name: "WebsocketServer",
        configureServer
    }
}

//#endregion

// Gameplay Variables
const rooms : Room[] = [];



function handleSocket(socket : WebSocket) {
    console.log("Someone joined!");

    socket.on("message", (msg) => {
        console.log("I got " + msg);
        socket.send("I recieved " + msg);
    })
}

class Room {
    host : WebSocket;
    code : string;
    players : WebSocket[] = [];

    constructor(host : WebSocket, code : string) {
        this.host = host;
        this.code = code;
    }

    sendToAll(data : BufferLike) {
        for (const player of this.players) {
            player.send(data);
        }
    }

    sendToOthers(data : unknown) {

    }
}