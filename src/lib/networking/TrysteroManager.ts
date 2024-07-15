import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom, selfId } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic, type NetworkID } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";
import { gameManager } from "$lib/Static";
import { getRandomUUID } from "$lib/Utility";

const APP_ID = "quotouflage-debug";

// type TrysteroPlayer = Player & {peerId : string}

export default class TrysteroManager extends EventTarget implements NetworkManager {

    roomConnection? : Room;
    hostPeerId? : string;
    
    createNewRoom() : string {
        // Generate new room code
        const code = getRandomUUID().replaceAll("-", "").substring(0, parseInt(PUBLIC_PIN_LENGTH)).toUpperCase()
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
        let recieveDetails : ActionReceiver<DataPayload>, recievePlayers : ActionReceiver<DataPayload>, recieveTopics : ActionReceiver<DataPayload>, recieveMessages : ActionReceiver<DataPayload>, recieveJudging : ActionReceiver<DataPayload>, recieveGuess : ActionReceiver<DataPayload>, recieveContinue : ActionReceiver<DataPayload>;
        [this.sendDetails, recieveDetails] = this.roomConnection.makeAction("details");  
        [this.sendPlayers, recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, recieveMessages] = this.roomConnection.makeAction("messages");
        [this.sendJudging, recieveJudging] = this.roomConnection.makeAction("judging");
        [this.sendGuess, recieveGuess] = this.roomConnection.makeAction("guess");  
        [this.sendContinue, recieveContinue] = this.roomConnection.makeAction("continue");

        // Add events for peer join/leave
        this.roomConnection?.onPeerJoin(() => {
            if (gameManager.hosting) {
                this.sendDetails!(gameManager.self.networkId);
            }
            this.dispatchEvent(new Event("join"));
        });

        this.roomConnection?.onPeerLeave((peerId) => {
            this.dispatchEvent(new Event("leave"));
            this.createAndDispatchEvent("leave", peerId)
        });

        // Connect actions to events
        recieveDetails((data : DataPayload, peerId : string) => {
            this.hostPeerId = peerId;
            this.createAndDispatchEvent("details", <{self: NetworkID, host: NetworkID}>{self: selfId, host: data});
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
            this.createAndDispatchEvent("guess", <NetworkID>data);
        });

        recieveContinue((data, peerId) => {
            if (peerId === this.hostPeerId) {
                this.dispatchEvent(new Event("continue"));
            }
        })
    }

    // Utility function for creating & sending CustomEvent(s)
    createAndDispatchEvent<Type>(eventName : string, detailType : Type) {
        const customEvent : CustomEvent<Type> = new CustomEvent(eventName, {detail: detailType, bubbles: true});
        this.dispatchEvent(customEvent);
    }


    //#region Gameplay Events

    sendDetails? : ActionSender<DataPayload>;
    
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
    sendContinue? : ActionSender<DataPayload>;
    //#endregion

}