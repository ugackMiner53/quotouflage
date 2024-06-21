import { joinRoom, type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic } from "$lib/Types";

const APP_ID = "quotouflage-debug";


export default class TrysteroManager implements NetworkManager {

    roomConnection? : Room;
    hostId? : UUID;
    playerToPeerIdMap = new Map<UUID, string>();
    
    createNewRoom() : string {
        // Generate new room code
        const code = crypto.randomUUID().substring(0, 7).toUpperCase()
        this.roomConnection = joinRoom({appId: APP_ID}, code)
        if (Object.keys(this.roomConnection.getPeers()).length >= 1) {
            console.warn(`Code ${code} was already in use! Regenerating...`);
            this.roomConnection.leave();
            return this.createNewRoom();
        } else {
            console.log(`Successfully created room ${code}`);
            this.createMethods();
            return code;
        }
    }
    
    connectToRoom(code: string): void {
        this.roomConnection = joinRoom({appId: APP_ID}, code);
        if (Object.keys(this.roomConnection.getPeers()).length < 1) {
            console.warn(`Code ${code} is not a valid code!`);
            throw new Error("InvalidCodeException");
        } else {
            console.log(`Successfully connected to ${code}`);
            this.createMethods();
        }
    }

    createMethods() {
        if (!this.roomConnection) return;

        // Create actions
        [this._sendPlayers, this._recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, this._recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, this._recieveMessages] = this.roomConnection.makeAction("messages");
        [this._sendJudging, this._recieveJudging] = this.roomConnection.makeAction("judging");
        [this._sendJudgement, this._recieveJudgment] = this.roomConnection.makeAction("judgement");  

        // Create implementable callbacks
        this.roomConnection?.onPeerJoin(() => this.playerJoined);
        this.roomConnection?.onPeerLeave(() => this.playerLeft);

        this._recievePlayers((data, peerId) => {
            const players = <Player[]>data;
            if (!this.hostId || peerId == this.hostId) {
                // NOTE: This means that the playerToPeerIdMap will never have already joined peers
                const host = players.find(player => player.host)
                if (host) {
                    this.playerToPeerIdMap.set(host.uuid, peerId)
                }
                this.recievePlayers!(players);


            } else if (players.length == 1) {
                this.playerToPeerIdMap.set(players[0].uuid, peerId)
                this.recievePlayers!(players);
            } else {
                console.warn("Ignoring multiple players from someone who is not host");
            }
        });

        this._recieveTopics(data => {this.recieveTopics!(<Topic[]>data)})
        this._recieveMessages(data => {this.recieveMessages!(<Message[]>data)})

        this._recieveJudging((data, peerId) => {
            if (!this.hostId || peerId == this.hostId) {
                this.recieveMessages!(<Message[]>data)
            } else {
                console.warn("Ignoring judging instruction from someone who is not host")
            }
        })

        this._recieveJudgment(data => {this.recieveJudgment!(<UUID>data)})
    }

    // Implementable Methods
    playerJoined?: (() => void);
    playerLeft?: (() => void);


    //#region Gameplay Actions
    _sendPlayers? : ActionSender<DataPayload>;
    _recievePlayers? : ActionReceiver<DataPayload>;

    sendTopics? : ActionSender<DataPayload>;
    _recieveTopics? : ActionReceiver<DataPayload>;

    sendMessages? : ActionSender<DataPayload>;
    _recieveMessages? : ActionReceiver<DataPayload>;

    _sendJudging? : ActionSender<DataPayload>;
    _recieveJudging? : ActionReceiver<DataPayload>;

    _sendJudgement? : ActionSender<DataPayload>;
    _recieveJudgment? : ActionReceiver<DataPayload>;
    //#endregion

    sendPlayers(players : Player[], target : UUID) {
        this._sendPlayers!(players, this.playerToPeerIdMap.get(target))
    }

    recievePlayers? : (players : Player[]) => void;
    recieveTopics? : (topics : Topic[]) => void;
    recieveMessages? : (messages : Message[]) => void;
    recieveJudging? : (topicUUID : UUID) => void;
    recieveJudgment? : (messageUUID : UUID) => void;

}