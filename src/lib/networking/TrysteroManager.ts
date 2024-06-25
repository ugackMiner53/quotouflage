import { type ActionReceiver, type ActionSender, type DataPayload, type Room } from "trystero";
import { joinRoom } from "trystero/torrent";
import type NetworkManager from "./NetworkManager";
import { type UUID, type Message, type Player, type Topic } from "$lib/Types";
import { PUBLIC_PIN_LENGTH } from "$env/static/public";

const APP_ID = "quotouflage-debug";

export default class TrysteroManager implements NetworkManager {

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
                this.playerJoined!();
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
        [this.sendHost, this._recieveHost] = this.roomConnection.makeAction("host");  
        [this.sendPlayers, this._recievePlayers] = this.roomConnection.makeAction("players");
        [this.sendTopics, this._recieveTopics] = this.roomConnection.makeAction("topics");
        [this.sendMessages, this._recieveMessages] = this.roomConnection.makeAction("messages");
        [this.sendJudging, this._recieveJudging] = this.roomConnection.makeAction("judging");
        [this.sendJudgement, this._recieveJudgment] = this.roomConnection.makeAction("judgement");  

        // Create implementable callbacks
        this.roomConnection?.onPeerJoin(() => {
            console.log("Intermediate intercept stage one");
            this.playerJoined!();
        });
        this.roomConnection?.onPeerLeave(() => this.playerLeft);

        // Connect actions to callbacks
        this._recieveHost((data, peerId) => {
            console.log("intermediate intercept host stage two")
            this.hostPeerId = peerId;
            this.recieveHost!(<UUID>data)
        });
        this._recievePlayers((data, peerId) => {this.recievePlayers!(<Player[]>data, peerId === this.hostPeerId);});
        this._recieveTopics((data, peerId) => {if (peerId === this.hostPeerId) this.recieveTopics!(<Topic[]>data)})
        this._recieveMessages(data => {this.recieveMessages!(<Message[]>data)})
        this._recieveJudging((data, peerId) => {if (peerId === this.hostPeerId) this.recieveJudging!(<UUID>data)})
        this._recieveJudgment(data => {this.recieveJudgment!(<UUID>data)})
    }

    // Implementable Methods
    playerJoined?: (() => void); // Likely not needed because player objects should be sent through sendPlayers();
    playerLeft?: (() => void);


    //#region Gameplay Actions
    sendHost? : ActionSender<DataPayload>;
    _recieveHost? : ActionReceiver<DataPayload>;

    sendPlayers? : ActionSender<DataPayload>;
    _recievePlayers? : ActionReceiver<DataPayload>;

    sendTopics? : ActionSender<DataPayload>;
    _recieveTopics? : ActionReceiver<DataPayload>;

    sendMessages? : ActionSender<DataPayload>;
    _recieveMessages? : ActionReceiver<DataPayload>;

    sendJudging? : ActionSender<DataPayload>;
    _recieveJudging? : ActionReceiver<DataPayload>;

    sendJudgement? : ActionSender<DataPayload>;
    _recieveJudgment? : ActionReceiver<DataPayload>;
    //#endregion

    recieveHost? : (hostId : UUID) => void;
    recievePlayers? : (players : Player[], fromHost : boolean) => void;
    recieveTopics? : (topics : Topic[]) => void;
    recieveMessages? : (messages : Message[]) => void;
    recieveJudging? : (topicUUID : UUID) => void;
    recieveJudgment? : (messageUUID : UUID) => void;

}