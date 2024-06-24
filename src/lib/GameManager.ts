import TrysteroManager from "./networking/TrysteroManager";
import { type UUID, type Message, type Player, type Topic } from "./Types";
import { getRandomEmoji } from "./Utility";

export default class GameManager {
    networkManager : TrysteroManager;
    gameCode? : string;
    hostId? : UUID;
    hosting : boolean = false;
    self : Player;

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
        }
        this.players[0] = this.self;
    }

    updateSelf(newSelf : Player) {
        this.self = newSelf;
    }

    createGame() {
        this.gameCode = this.networkManager.createNewRoom();
        this.hostId = this.self.uuid;
        this.hosting = true;
        this.self.emoji = "👑";
        this.createMethods();
    } 

    async joinGame(code : string) : Promise<void> {
        await this.networkManager.connectToRoom(code);
        this.gameCode = code;
        this.createMethods();
        
        // Wait to recieve Host before saying we're connected
        return new Promise(resolve => {
            this.networkManager.recieveHost = (hostId : UUID) => {
                this.hostId = hostId;
                this.hosting = this.self.uuid === hostId
                resolve();
            }
        })
    }

    createMethods() {
        this.networkManager.recievePlayers = this.recievePlayers;
        this.networkManager.recieveTopics = this.recieveTopics;
        this.networkManager.recieveMessages = this.recieveMessages;
        this.networkManager.recieveJudging = this.recieveJudging;
        this.networkManager.recieveJudgment = this.recieveJudgement;
    }

    //#region Network Events

    recievePlayers(players : Player[], fromHost : boolean) {
        if (fromHost) {
            this.players = players;
        } else if (!fromHost && players.length == 1) {
            this.players.push(players[0]);
        }
    }

    recieveTopics(topics : Topic[]) {
        this.topics = topics;
    }

    recieveMessages(messages : Message[]) {
        this.messages = this.messages.concat(messages);
    }

    recieveJudging(judgeId : UUID) {
        console.log("Not implemented " + judgeId);
    }

    recieveJudgement(messageId : UUID) {
        console.log("Not implemented " + messageId);
    }

    //#endregion
}
