import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom, selfId } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic, type NetworkID } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";
import { gameManager } from "$lib/Static";
import { getRandomUUID } from "$lib/Utility";
import { get } from "svelte/store";

export default class TrysteroManager extends EventTarget implements NetworkManager {

    roomConnection? : Room;
    
    createNewRoom() : string {
        // Generate new room code
        const code = getRandomUUID().replaceAll("-", "").substring(0, parseInt(PUBLIC_PIN_LENGTH)).toUpperCase()
        import("$env/static/public").then(env => {
            this.roomConnection = joinRoom({appId: env.PUBLIC_TRYSTERO_APPID}, code)
            console.log(`Attempted to create room ${code}`);
            this.createAndDispatchEvent("details", <{self: NetworkID, host: NetworkID}>{self: selfId, host: selfId});
            this.createMethods();
        })
        return code;
    }
    
    async connectToRoom(code: string): Promise<void> {
        this.roomConnection = joinRoom({appId: (await import("$env/static/public")).PUBLIC_TRYSTERO_APPID}, code);

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
            if (get(gameManager.hosting)) {
                this.sendDetails!(gameManager.self.networkId);
            }
            this.dispatchEvent(new Event("join"));
        });

        this.roomConnection?.onPeerLeave((peerId) => {
            console.log(`Peer ${peerId} left game!`);
            this.createAndDispatchEvent("leave", peerId)
        });

        // Connect actions to events
        recieveDetails((data : DataPayload) => {
            this.createAndDispatchEvent("details", <{self: NetworkID, host: NetworkID}>{self: selfId, host: data});
        });

        recievePlayers((data : DataPayload, peerId : string) => {
            this.createAndDispatchEvent(
                "players", 
                {
                    players: <Player[]>data,
                    isHost: peerId === gameManager.hostId
                }
            );
        });

        recieveTopics((data : DataPayload, peerId : string) => {
            if (peerId === gameManager.hostId) {
                this.createAndDispatchEvent("topics", <Topic[]>data);
            }
        });

        recieveMessages(data => {
            this.createAndDispatchEvent("messages", <Message[]>data);
        });

        recieveJudging((data, peerId) => {
            if (peerId === gameManager.hostId) {
                this.createAndDispatchEvent("judging", <UUID>data);
            }
        });

        recieveGuess(data => {
            this.createAndDispatchEvent("guess", <NetworkID>data);
        });

        recieveContinue((data, peerId) => {
            if (peerId === gameManager.hostId) {
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