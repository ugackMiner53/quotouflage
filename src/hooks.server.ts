import { building } from '$app/environment';
// import type { Handle } from '@sveltejs/kit';
import { WebSocketServer } from 'ws';



function createWebsocketServer() {
    const wss = new WebSocketServer({
        port: 2469
    });
    wss.on("connection", (socket) => {
        console.log("connect")
        socket.on("message", (data) => {
            console.log("got  " + data)
            socket.send("i got " + data);
        })
    })
}

if (!building) {
    createWebsocketServer();

    // Without this, the app doesn't close. Don't ask me why.
    process.on('SIGINT', function() {
        process.exit(0);
    });
}

// export const handle: Handle = async ({ event, resolve }) => {
// 	const response = await resolve(event);	
//     return response;
// };