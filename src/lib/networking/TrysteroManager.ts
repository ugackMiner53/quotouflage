import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";

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
        let recieveHost : ActionReceiver<DataPayload>, recievePlayers : ActionReceiver<DataPayload>, recieveTopics : ActionReceiver<DataPayload>, recieveMessages : ActionReceiver<DataPayload>, recieveJudging : ActionReceiver<DataPayload>, recieveJudgment : ActionReceiver<DataPayload>;
        [this.sendHost, recieveHost] = this.roomConnection.makeAction("host");  
        [this.sendPlayers, recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, recieveMessages] = this.roomConnection.makeAction("messages");
        [this.sendJudging, recieveJudging] = this.roomConnection.makeAction("judging");
        [this.sendJudgement, recieveJudgment] = this.roomConnection.makeAction("judgement");  

        // Add events for peer join/leave
        this.roomConnection?.onPeerJoin(() => {
            console.log("Intermediate intercept stage one");
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

        recieveJudgment(data => {
            this.createAndDispatchEvent("judgment", <UUID>data);
        });
    }

    // Utility function for creating & sending CustomEvent(s)
    createAndDispatchEvent<Type>(eventName : string, detailType : Type) {
        const customEvent : CustomEvent<Type> = new CustomEvent(eventName, {detail: detailType, bubbles: true});
        this.dispatchEvent(customEvent);
    }


    //#region Gameplay Events
    sendHost? : ActionSender<DataPayload>;
    sendPlayers? : ActionSender<DataPayload>;
    sendTopics? : ActionSender<DataPayload>;
    sendMessages? : ActionSender<DataPayload>;
    sendJudging? : ActionSender<DataPayload>;
    sendJudgement? : ActionSender<DataPayload>;
    //#endregion

}