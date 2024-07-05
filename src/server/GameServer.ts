import { WebSocket, WebSocketServer } from "ws";
import { v6 as uuidv6 } from "uuid";


export enum MessageType {
    JOIN,
    LEAVE,
    DETAILS,
    PLAYERS,
    TOPICS,
    MESSAGES,
    JUDGING,
    GUESS,
    CONTINUE
}

export type WebsocketMessage = {
    type : MessageType,
    data : unknown
}

type GameSocket = WebSocket & {room? : Room, uuid : string}

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
                        room.host.send(JSON.stringify({type: MessageType.JOIN}));
                    } else {
                        // TODO If room does not exist & user is not creating room, then reject join and tell user
                        console.log(`Making room ${code} and sending details`);
                        const room = new Room(socket, code);
                        this.rooms.set(code, room);
                        socket.room = room;
                    }
                    this.sendDetails(socket);
                    break;
                }
                case MessageType.LEAVE: {
                    break;
                }
                case MessageType.PLAYERS: {
                    socket.room?.sendToOthers({type: MessageType.PLAYERS, data: {players: message.data, isHost: socket.room?.host === socket}}, socket)
                    break;
                }

                case MessageType.MESSAGES: {
                    socket.room?.sendToOthers(message, socket);
                    break;
                }

                // case MessageType.DETAILS: {
                //     this.sendDetails(socket, (<{host: string}>message.data).host);
                //     break;
                // }

                case MessageType.TOPICS:
                case MessageType.JUDGING:
                case MessageType.CONTINUE:
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

        socket.on("close", () => {
            if (socket.room) {
                socket.room.disconnectPlayer(socket);
                if (socket.room.players.length <= 0) {
                    console.log(`No players found in ${socket.room.code}, deleting!`);
                    this.rooms.delete(socket.room.code);
                }
            }
        })
    }

    sendDetails(socket : GameSocket) {
        socket.uuid = uuidv6();
        const host = socket.room?.host.uuid;

        const message = {type: MessageType.DETAILS, data: {self: socket.uuid, host: host}};
        socket.send(JSON.stringify(message));
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

    disconnectPlayer(player : GameSocket) {
        this.players = this.players.filter(socket => socket.uuid !== player.uuid);
        this.sendToOthers({type: MessageType.LEAVE, data: player.uuid}, player);
    }
}