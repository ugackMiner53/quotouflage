import { get, writable, type Writable } from "svelte/store";
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
    players : Writable<Player[]> = writable([]);
    topics : Topic[] = [];
    messages : Message[] = [];


    constructor(name : string) {
        this.networkManager = new TrysteroManager();
        this.self = {
            uuid: <UUID>crypto.randomUUID(),
            name: name.toUpperCase(),
            emoji: getRandomEmoji(),
        }
        this.players.set([this.self])
    }

    updateSelf(newSelf : Player) {
        this.self = newSelf;
    }

    createGame() {
        this.createMethods();

        this.gameCode = this.networkManager.createNewRoom();
        this.hostId = this.self.uuid;
        this.hosting = true;
        this.self.emoji = "👑";
    } 

    async joinGame(code : string) : Promise<void> {
        this.gameCode = code;
        this.createMethods();
        await this.networkManager.connectToRoom(code);
        
        // Wait to recieve Host before saying we're connected
        return new Promise(resolve => {
            this.networkManager.addEventListener("host", (event : CustomEventInit<UUID>) => {
                console.log("Recieved Host");
                this.hostId = event.detail;
                this.hosting = this.self.uuid === this.hostId;
                this.networkManager.sendPlayers!(get(this.players));
                resolve();
            })
        })
    }

    createMethods() {
        this.networkManager.addEventListener("join", () => {this.playerJoined()});

        this.networkManager.addEventListener("players", (event : CustomEventInit<{players: Player[], isHost : boolean}>) => {
            this.recievePlayers(event.detail!.players, event.detail!.isHost);
        })

        this.networkManager.addEventListener("topics", (event : CustomEventInit<Topic[]>) => {
            this.recieveTopics(event.detail!);
        })

        this.networkManager.addEventListener("messages", (event : CustomEventInit<Message[]>) => {
            this.recieveMessages(event.detail!);
        })

        this.networkManager.addEventListener("judging", (event : CustomEventInit<UUID>) => {
            this.recieveJudging(event.detail!);
        })

        this.networkManager.addEventListener("judgement", (event : CustomEventInit<UUID>) => {
            this.recieveJudgement(event.detail!);
        })
    }

    //#region Network Events

    playerJoined() {
        console.log("SECOND PEER JOIN OMG OMG ");
        console.log(`WTF im hosting: ${this.hosting}`)
        console.log(this);
        if (this.hosting) {
            console.log("IM HOSTING, the UUID " + this.self.uuid + " IS GOING OUT");
            this.networkManager.sendHost!(this.self.uuid);
        }
    }

    playerLeft() {
        if (this.hosting) {
            this.networkManager.sendPlayers!(get(this.players));
        }
    }

    recievePlayers(players : Player[], fromHost : boolean) {
        console.log("I GOT PLAYERS");
        if (fromHost) {
            this.players.set(players);
        } else if (this.hosting && !fromHost && players.length == 1) {
            this.players.update(newPlayers => {
                newPlayers.push(players[0]);
                return newPlayers;
            })
            if (this.hosting) {
                this.networkManager.sendPlayers!(get(this.players));
            }
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
