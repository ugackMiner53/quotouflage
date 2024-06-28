import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";
import { gameManager } from "$lib/Static";

const APP_ID = "quotouflage-debug";

// type TrysteroPlayer = Player & {peerId : string}

export default class TrysteroManager extends EventTarget implements NetworkManager {

    roomConnection? : Room;
    hostPeerId? : string;
    
    createNewRoom() : string {
        // Generate new room code
        const code = crypto.randomUUID().replaceAll("-", "").substring(0, parseInt(PUBLIC_PIN_LENGTH)).toUpperCase()
        this.roomConnection = joinRoom({appId: APP_ID}, code)
        console.log(`Attempted to create room ${code}`);
        this.createMethods();
        return code;
    }
    
    connectToRoom(code: string): Promise<void> {
        this.roomConnection = joinRoom({appId: APP_ID}, code);

        return new Promise(resolve => {
            this.roomConnection?.onPeerJoin(() => {
                this.createMethods();
                dispatchEvent(new Event("join"));
                resolve();
            })
        })
    }

    createMethods() {
        if (!this.roomConnection) return;

        // Create actions
        let recieveHost : ActionReceiver<DataPayload>, recievePlayers : ActionReceiver<DataPayload>, recieveTopics : ActionReceiver<DataPayload>, recieveMessages : ActionReceiver<DataPayload>, recieveJudging : ActionReceiver<DataPayload>, recieveGuess : ActionReceiver<DataPayload>, recieveLobby : ActionReceiver<DataPayload>;
        [this.sendHost, recieveHost] = this.roomConnection.makeAction("host");  
        [this.sendPlayers, recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, recieveMessages] = this.roomConnection.makeAction("messages");
        [this.sendJudging, recieveJudging] = this.roomConnection.makeAction("judging");
        [this.sendGuess, recieveGuess] = this.roomConnection.makeAction("guess");  
        [this.sendLobby, recieveLobby] = this.roomConnection.makeAction("lobby");

        // Add events for peer join/leave
        this.roomConnection?.onPeerJoin(() => {
            if (gameManager.hosting) {
                this.sendHost!(gameManager.self.uuid);
            }
            this.dispatchEvent(new Event("join"));
        });

        // TODO Not sure how to handle players leaving when we don't know their ID from GameManager and we don't know the players from TrysteroManager
        this.roomConnection?.onPeerLeave(() => {
            this.dispatchEvent(new Event("leave"));
        });

        // Connect actions to events
        recieveHost((data : DataPayload, peerId : string) => {
            this.hostPeerId = peerId;
            this.createAndDispatchEvent("host", <UUID>data);
        });

        recievePlayers((data : DataPayload, peerId : string) => {
            this.createAndDispatchEvent(
                "players", 
                {
                    players: <Player[]>data,
                    isHost: peerId === this.hostPeerId
                }
            );
        });

        recieveTopics((data : DataPayload, peerId : string) => {
            if (peerId === this.hostPeerId) {
                this.createAndDispatchEvent("topics", <Topic[]>data);
            }
        });

        recieveMessages(data => {
            this.createAndDispatchEvent("messages", <Message[]>data);
        });

        recieveJudging((data, peerId) => {
            if (peerId === this.hostPeerId) {
                this.createAndDispatchEvent("judging", <UUID>data);
            }
        });

        recieveGuess(data => {
            this.createAndDispatchEvent("guess", <UUID>data);
        });

        recieveLobby((data, peerId) => {
            if (peerId === this.hostPeerId) {
                this.dispatchEvent(new Event("lobby"));
            }
        })
    }

    // Utility function for creating & sending CustomEvent(s)
    createAndDispatchEvent<Type>(eventName : string, detailType : Type) {
        const customEvent : CustomEvent<Type> = new CustomEvent(eventName, {detail: detailType, bubbles: true});
        this.dispatchEvent(customEvent);
    }


    //#region Gameplay Events

    sendHost? : ActionSender<DataPayload>;
    
    //@ts-expect-error Trystero needs these functions to be ActionSenders, which is trystero specific and cannot be encapsulated in NetworkManager
    sendPlayers? : ActionSender<DataPayload>;
    //@ts-expect-error See above
    sendTopics? : ActionSender<DataPayload>;
    //@ts-expect-error See above
    sendMessages? : ActionSender<DataPayload>;
    //@ts-expect-error See above
    sendJudging? : ActionSender<DataPayload>;
    //@ts-expect-error See above
    sendGuess? : ActionSender<DataPayload>;
    //@ts-expect-error See above
    sendLobby? : ActionSender<DataPayload>;
    //#endregion

}