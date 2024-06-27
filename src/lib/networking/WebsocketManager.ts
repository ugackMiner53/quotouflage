import type { UUID, Player, Topic, Message } from "$lib/Types";
import type NetworkManager from "./NetworkManager";
import { PUBLIC_WEBSOCKET_URL } from "$env/static/public";


type WebsocketMessage = {
    type : MessageType,
    data : unknown
}

enum MessageType {
    JOIN,
    LEAVE,
    PLAYERS,
    TOPICS,
    MESSAGES,
    JUDGING,
    JUDGEMENT
}

export default class WebsocketManager extends EventTarget implements NetworkManager {

    websocket? : WebSocket;
    
    async connectToWebsocket() : Promise<void> {
        let url = PUBLIC_WEBSOCKET_URL;
        if (!url) {
            url = `${location.protocol.includes("s") ? "wss" : "ws"}://${location.host}`
        }
        this.websocket = new WebSocket(url)
        
        return new Promise((resolve, reject) => {
            this.websocket!.onopen = () => resolve();
            this.websocket!.onmessage = (event) => this.handleWebsocketMessage(event);
            this.websocket!.onerror = () => reject();
        })
    }

    createNewRoom() : string {
        // Generate new room code
        const code = crypto.randomUUID().substring(0, 7).toUpperCase()
        this.connectToWebsocket().then(() => {
            this.sendWebsocketMessage({type: MessageType.JOIN, code});
        });
        return code;
    }
    
    async connectToRoom(code: string): Promise<void> {
        await this.connectToWebsocket();
        this.sendWebsocketMessage({type: MessageType.JOIN, code});
    }

    sendWebsocketMessage(object : unknown) {
        const string = JSON.stringify(object);
        this.websocket?.send(string);
    }

    handleWebsocketMessage(messageEvent : MessageEvent<string>) {
        const message : WebsocketMessage = JSON.parse(messageEvent.data);
        switch (message.type) {
            case MessageType.JOIN: {
                this.dispatchEvent(new Event("join"));
                // this.createAndDispatchEvent("join", )
                break;
            }
            case MessageType.LEAVE: {
                this.dispatchEvent(new Event("leave"));
                // this.createAndDispatchEvent("leave", )
                break;
            }
            case MessageType.PLAYERS: {
                const data = <{players : Player[], isHost : boolean}>message.data;
                this.createAndDispatchEvent("players", {players: data.players, isHost: data.isHost})
                break;
            }
            case MessageType.TOPICS: {
                this.createAndDispatchEvent("topics", <Topic[]>message.data)
                break;
            }
            case MessageType.MESSAGES: {
                this.createAndDispatchEvent("messages", <Message[]>message.data)
                break;
            }
            case MessageType.JUDGING: {
                this.createAndDispatchEvent("judging", <UUID>message.data)
                break;
            }
            case MessageType.JUDGEMENT: {
                this.createAndDispatchEvent("guess", <UUID>message.data)
                break;
            }
            default: {
                console.error(`Message type ${message.type} not expected!`);
            }
        }
        
    }

    createAndDispatchEvent<Type>(eventName : string, detailType : Type) {
        const customEvent : CustomEvent<Type> = new CustomEvent(eventName, {detail: detailType});
        this.dispatchEvent(customEvent);
    }


    sendPlayers(players: Player[]): void {
        this.sendWebsocketMessage({type: MessageType.PLAYERS, players});
    }
    sendTopics(topics: Topic[]): void {
        this.sendWebsocketMessage({type: MessageType.TOPICS, topics});
    }
    sendMessages(messages: Message[]): void {
        this.sendWebsocketMessage({type: MessageType.MESSAGES, messages});
    }
    sendJudging(topicId: UUID): void {
        this.sendWebsocketMessage({type: MessageType.JUDGING, topicId});
    }
    sendGuess(messageId: UUID): void {
        this.sendWebsocketMessage({type: MessageType.JUDGEMENT, messageId})
    }
}