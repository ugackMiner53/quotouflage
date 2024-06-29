import { WebSocket, WebSocketServer } from "ws";

export enum MessageType {
    JOIN,
    LEAVE,
    HOST,
    PLAYERS,
    TOPICS,
    MESSAGES,
    JUDGING,
    GUESS,
    LOBBY
}

export type WebsocketMessage = {
    type : MessageType,
    data : unknown
}

type GameSocket = WebSocket & {room? : Room}

export default class GameServer {
    websocketServer : WebSocketServer;

    constructor(websocketServer : WebSocketServer) {
        this.websocketServer = websocketServer;
        this.websocketServer.on("connection", this.handleSocket.bind(this));
    }

    // Gameplay Variables
    // rooms : Room[] = [];
    rooms = new Map<string, Room>();

    handleSocket(socket : GameSocket) {
        socket.on("message", (messageStr : string) => {
            const message : WebsocketMessage = JSON.parse(messageStr);
            switch (message.type) {
                case MessageType.JOIN: {
                    const code = <string>message.data;
                    if (this.rooms.has(code)) {
                        const room = <Room>this.rooms.get(code)
                        room.connectPlayer(socket);
                        socket.room = room;
                    } else {
                        // TODO If room does not exist & user is not creating room, then reject join and tell user
                        const room = new Room(socket, code);
                        this.rooms.set(code, room);
                        socket.room = room;
                    }
                    break;
                }
                case MessageType.LEAVE: {
                    break;
                }
                case MessageType.PLAYERS: {
                    socket.room?.sendToOthers({type: MessageType.PLAYERS, data: {players: message.data, isHost: socket.room?.host === socket}}, socket)
                    break;
                }

                case MessageType.MESSAGES:
                {
                    socket.room?.sendToOthers(message, socket);
                    break;
                }

                case MessageType.HOST:
                case MessageType.TOPICS:
                case MessageType.JUDGING:
                case MessageType.LOBBY:
                {
                    socket.room?.authenticatedSendToOthers(message, socket);
                    break;
                }

                case MessageType.GUESS: {
                    // This is separated because only the selected judge should be allowed to make the authenticated send, but keeping track of who is judging is too hard of a task lol
                    socket.room?.authenticatedSendToOthers(message, socket, socket)
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
        this.sendToOthers({type: MessageType.JOIN, data: null}, player)
    }
}