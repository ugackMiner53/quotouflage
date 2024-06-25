import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";

const APP_ID = "quotouflage-debug";

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
                console.log("FIRST PEER JOIN STATEMENT")
                this.createMethods();
                dispatchEvent(new Event("join"));
                resolve();
            })
        })
        // if (Object.keys(this.roomConnection.getPeers()).length < 1) {
        //     console.warn(`Code ${code} is not a valid code!`);
        //     throw new Error("InvalidCodeException");
        // } else {
        //     console.log(`Successfully connected to ${code}`);
        // }
    }

    createMethods() {
        if (!this.roomConnection) {
            console.error("Room connection not init before createMethods in TrysteroManager")
            return;
        }

        // Create actions
        let recieveHost : ActionReceiver<DataPayload>, recievePlayers : ActionReceiver<DataPayload>, recieveTopics : ActionReceiver<DataPayload>, recieveMessages : ActionReceiver<DataPayload>, recieveJudging : ActionReceiver<DataPayload>, recieveJudgment : ActionReceiver<DataPayload>;
        [this.sendHost, recieveHost] = this.roomConnection.makeAction("host");  
        [this.sendPlayers, recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, recieveMessages] = this.roomConnection.makeAction("messages");
        [this.sendJudging, recieveJudging] = this.roomConnection.makeAction("judging");
        [this.sendJudgement, recieveJudgment] = this.roomConnection.makeAction("judgement");  

        // Create implementable callbacks
        this.roomConnection?.onPeerJoin(() => {
            console.log("Intermediate intercept stage one");
            this.dispatchEvent(new Event("join"));
        });
        this.roomConnection?.onPeerLeave(() => {
            this.dispatchEvent(new Event("leave"));
        });

        // Connect actions to callbacks
        recieveHost((data : DataPayload, peerId : string) => {
            console.log("[TrysteroManager] Host Recieved, dispatching event...")
            this.hostPeerId = peerId;
            this.createAndDispatchEvent<UUID>("host", <UUID>data);
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
        const customEvent : CustomEvent<Type> = new CustomEvent(eventName, {detail: detailType});
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