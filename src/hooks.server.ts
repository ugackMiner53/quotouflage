import { building } from '$app/environment';
import { PUBLIC_ADAPTER, PUBLIC_WEBSOCKET_PORT } from '$env/static/public';
import GameServer from './server/GameServer';

declare global {
    // eslint-disable-next-line no-var
    var gameServer : GameServer;
}

function createGameServer() {
    global.gameServer = new GameServer(parseInt(PUBLIC_WEBSOCKET_PORT));
}

if (!building && PUBLIC_ADAPTER === "websocket" && !global.gameServer) {
    createGameServer();

    // Without this, the app doesn't close. Don't ask me why.
    process.on('SIGINT', function() {
        process.exit(0);
    });
} else if (global.gameServer) {
    global.gameServer.reset();
}