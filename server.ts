import { createServer, type RequestListener, type IncomingMessage, type ServerResponse } from "http";
import { WebSocketServer } from "ws";
import { handler } from "./build/handler.js";
import GameServer from "./src/server/GameServer";

const port = process.env.PORT || 3000;
const server = createServer(<RequestListener<typeof IncomingMessage, typeof ServerResponse>>handler);

const wss = new WebSocketServer({ noServer: true });
const gameServer = new GameServer(wss);

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    })
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})