import { building, dev } from '$app/environment';
import { PUBLIC_ADAPTER } from '$env/static/public';
import { WebSocketServer } from 'ws';
import GameServer from './server/GameServer';

declare global {
    // eslint-disable-next-line no-var
    var gameServer : GameServer;
}

async function createGameServer() {
    const port = parseInt((await import("$env/static/public")).PUBLIC_WEBSOCKET_PORT)
    global.gameServer = new GameServer(new WebSocketServer({port}));
}

if (!building && dev && PUBLIC_ADAPTER === "websocket" && !global.gameServer) {
    createGameServer();

    // Without this, the app doesn't close. Don't ask me why.
    process.on('SIGINT', function() {
        process.exit(0);
    });
} else if (global.gameServer) {
    global.gameServer.reset();
}