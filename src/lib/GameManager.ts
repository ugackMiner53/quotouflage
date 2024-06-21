import TrysteroManager from "./networking/TrysteroManager";
import { type UUID, type Message, type Player, type Topic } from "./Types";
import { getRandomEmoji } from "./Utility";

class GameManager {
    networkManager : TrysteroManager;
    gameCode? : string;
    self : Player;
    hostId? : UUID;
    hosting : boolean = false;

    // Round specific variables
    players : Player[] = [];
    topics : Topic[] = [];
    messages : Message[] = [];



    constructor(name : string) {
        this.networkManager = new TrysteroManager();
        this.self = {
            uuid: <UUID>crypto.randomUUID(),
            name,
            emoji: getRandomEmoji(),
            host: false
        }
    }

    createGame() {
        this.gameCode = this.networkManager.createNewRoom();
        this.hosting = true;
        this.self.host = true;
        this.hostId = this.self.uuid;
        this.createMethods();
    } 

    joinGame(code : string) : boolean {
        try {
            this.networkManager.connectToRoom(code);
        } catch {
            return false;
        }
        this.gameCode = code;
        this.createMethods();
        return true;
    }

    createMethods() {
        // this.networkManager.playerJoined = () => {
        //     if (this.self.host) {
        //         this.networkManager.sendPlayers(this.players, )
        //     }
        // }

        this.networkManager.recievePlayers = (players : Player[]) => {
            if (this.hosting && players.length == 1) {
                this.players.push(players[0]);
            } else {

            }
        }
    }

    //#region Network Events

    recievePlayers(players : Player[]) {

    }





    sendTopics() {
        // this.networkManager.sendTopics();
    }
}
