import { WebSocket, WebSocketServer } from "ws";

export enum MessageType {
    JOIN,
    LEAVE,
    PLAYERS,
    TOPICS,
    MESSAGES,
    JUDGING,
    GUESS
}

export type WebsocketMessage = {
    type : MessageType,
    data : unknown
}

type GameSocket = WebSocket & {room? : Room}

export default class GameServer {
    websocketServer : WebSocketServer;

    constructor(port: number) {
        this.websocketServer = new WebSocketServer({port})
        this.websocketServer.on("connection", this.handleSocket);
    }

    // Gameplay Variables
    // rooms : Room[] = [];
    rooms = new Map<string, Room>();

    handleSocket(socket : GameSocket) {
        console.log("Someone joined!");

        socket.on("message", (messageStr : string) => {
            const message : WebsocketMessage = JSON.parse(messageStr);
            switch (message.type) {
                case MessageType.JOIN: {
                    console.log("User JOIN");
                    const code = <string>message.data;
                    if (this.rooms.has(code)) {
                        const room = <Room>this.rooms.get(code)
                        room.connectPlayer(socket);
                        socket.room = room;
                    } else {
                        const room = new Room(socket, code);
                        this.rooms.set(code, room);
                        socket.room = room;
                    }
                    break;
                }
                case MessageType.LEAVE: {
                    break;
                }

                case MessageType.PLAYERS: 
                case MessageType.MESSAGES:
                {
                    socket.room?.sendToOthers(message, socket);
                    break;
                }

                case MessageType.TOPICS:
                case MessageType.JUDGING:
                {
                    socket.room?.authenticatedSendToOthers(message, socket);
                    break;
                }

                case MessageType.GUESS: {
                    // This is separated because only the selected judge should be allowed to make the authenticated send, but keeping track of who is judging is too hard of a task lol
                    socket.room?.authenticatedSendToOthers(message, socket)
                    break;
                }


                default: {
                    console.warn(`Invalid type ${message.type}!`);
                }
            }
        })
    }

    reset() {
        this.rooms.clear();
        this.websocketServer.clients.forEach(socket => {
            socket.close();
        })
    }
}




class Room {
    host : GameSocket;
    code : string;
    players : GameSocket[];

    constructor(host : GameSocket, code : string) {
        this.host = host;
        this.players = [host];
        this.code = code;
    }

    authenticatedSendToOthers(data : WebsocketMessage, socket : GameSocket, expected : GameSocket = this.host) {
        if (expected === socket) {
            this.sendToOthers(data, socket);
        }
    }

    sendToOthers(data : WebsocketMessage, ignore : GameSocket) {
        for (const player of this.players) {
            if (player !== ignore) {
                player.send(JSON.stringify(data))
            }
        }
    }

    connectPlayer(player : GameSocket) {
        this.players.push(player);
    }





}