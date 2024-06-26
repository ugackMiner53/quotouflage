import { get, writable, type Writable } from "svelte/store";
import TrysteroManager from "./networking/TrysteroManager";
import { type UUID, type Message, type Player, type Topic } from "./Types";
import { getRandomEmoji, getRandomTopic } from "./Utility";
import { goto } from "$app/navigation";

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

    uuidToPlayer(uuid: UUID) : Player|undefined {
        const players = get(this.players);
        const match = players.find(player => {return player.uuid === uuid});
        return match;
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

    startGame() {
        if (this.hosting) {
            const topics : Topic[] = [];

            const players = get(this.players);
            players.sort((a, b) => {
                return a > b ? 1 : -1;
            })

            // Sattolo's Algorithm to cycle elements so that no topic is judged by the person it's about
            const topicJudges = players.map(player => player.uuid);
            for (let i=topicJudges.length-1; i>0; i--) {
                const randomIndex = Math.floor(Math.random()*(i-1));
                const tmp = topicJudges[randomIndex];
                topicJudges[randomIndex] = topicJudges[i];
                topicJudges[i] = tmp;
            }


            Promise.all(get(this.players).map(async (player, index) => {
                topics.push({
                    uuid: <UUID>crypto.randomUUID(),
                    about: player.uuid,
                    judge: topicJudges[index],
                    topic: await getRandomTopic(),
                });
            })).then(() => {
                console.log(topics)
                this.networkManager.sendTopics!(topics);
                this.recieveTopics(topics);
            })
        }
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

    sendMessages(messages : Message[]) {
        this.messages = this.messages.concat(messages);
        this.networkManager.sendMessages!(messages);
    }

    sendJudgement(guessedPlayerId : UUID) {
        this.networkManager.sendJudgement!(guessedPlayerId);
    }

    //#region Network Events

    playerJoined() {
        if (this.hosting) {
            console.log("IM HOSTING, the UUID " + this.self.uuid + " IS GOING OUT");
            this.networkManager.sendHost!(this.self.uuid);
        }
    }

    playerLeft() {
        if (this.hosting) {
            // See TrysteroManager for the issue with this
            console.error("Player left and I don't know what to do!");
            // this.networkManager.sendPlayers!(get(this.players));
        }
    }

    recievePlayers(players : Player[], fromHost : boolean) {
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
        goto("/game");
    }

    recieveMessages(messages : Message[]) {
        console.log("Recieved Messages!");
        this.messages = this.messages.concat(messages);
    }

    recieveJudging(topicId : UUID) {
        console.log("Not implemented " + topicId);
    }

    recieveJudgement(guessedPlayerId : UUID) {
        console.log("Not implemented " + guessedPlayerId);
    }

    //#endregion
}
