import type { Plugin, ServerHook } from "vite";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import type { Server as HttpServer } from "http";

dotenv.config();

let websocketServer : WebSocketServer;

export const configureServer : ServerHook = (server) => {
    if (!websocketServer) {
        console.log("Configurlating the server!");;
        websocketServer = new WebSocketServer({
            server: import.meta.env.PROD ? <HttpServer>server.httpServer : undefined,
            port: import.meta.env.DEV ? 4832 : undefined
        })
    }

    websocketServer.on("connection", (socket) => {
        socket.send("Hi hi hi!");
        console.log("Someone joined!");

        socket.on("message", (msg) => {
            console.log("I got " + msg);
            socket.send("I recieved " + msg);
        })
    })
}

export const websocketServerPlugin : Plugin = {
    name: "WebsocketServer",
    configureServer,

}