import { get, writable, type Writable } from "svelte/store";
import TrysteroManager from "./networking/TrysteroManager";
import { type UUID, type Message, type Player, type Topic, type NetworkID } from "./Types";
import { getRandomEmoji, getRandomTopic, getRandomUUID } from "./Utility";
import { goto } from "$app/navigation";
import { PUBLIC_ADAPTER } from "$env/static/public";
import WebsocketManager from "./networking/WebsocketManager";

export default class GameManager extends EventTarget {
    networkManager : TrysteroManager|WebsocketManager;
    gameCode? : string;
    hostId? : NetworkID;
    hosting : boolean = false;
    self : Player;

    // Round specific variables
    players : Writable<Player[]> = writable([]);
    submittedPlayers : Writable<Set<NetworkID>> = writable(new Set<NetworkID>());
    topics : Topic[] = [];
    messages : Message[] = [];


    constructor(name : string) {
        super();
        this.networkManager = PUBLIC_ADAPTER === "trystero" ? new TrysteroManager() : new WebsocketManager();
        this.self = {
            networkId: <NetworkID>"NO NETWORK ID INITIALIZED",
            name: name.toUpperCase(),
            emoji: getRandomEmoji(),
            score: 0
        }
        this.players.set([this.self]);
        this.createMethods();
    }

    updateSelf(newSelf : Player) {
        this.self = newSelf;
        this.players.set([this.self]);
    }

    networkIdToPlayer(networkId: NetworkID) : Player|undefined {
        const players = get(this.players);
        return players.find(player => {return player.networkId === networkId});
    }

    uuidToTopic(uuid : UUID) : Topic|undefined {
        return this.topics.find(topic => {return topic.uuid === uuid});
    }

    createGame() {
        this.gameCode = this.networkManager.createNewRoom();
        this.hosting = true;
        this.self.emoji = "👑";

        const recieveGameDetails = (event : CustomEventInit<{self: NetworkID, host: NetworkID}>) => {
            console.log("Recieved Self ID");
            this.self.networkId = event.detail!.self;
            this.hostId = this.self.networkId;
        };

        this.networkManager.addEventListener("details", recieveGameDetails);
    } 

    async joinGame(code : string, signal : AbortSignal) : Promise<void> {
        this.gameCode = code;
        await this.networkManager.connectToRoom(code);
        
        // Wait to recieve Host before saying we're connected
        return new Promise((resolve, reject) => {
            if (signal.aborted) {
                reject(signal.reason);
            }

            const recieveGameDetails = (event : CustomEventInit<{self: NetworkID, host: NetworkID}>) => {
                console.log("Recieved Host");
                this.self.networkId = event.detail!.self;
                this.hostId = event.detail!.host;
                this.hosting = this.self.networkId === this.hostId;
                this.networkManager.sendPlayers!(get(this.players));
                resolve();
            };

            this.networkManager.addEventListener("details", recieveGameDetails);

            signal.addEventListener("abort", () => {
                this.networkManager.removeEventListener("details", recieveGameDetails);
                reject(signal.reason);
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
            const topicJudges = players.map(player => player.networkId);
            for (let i=topicJudges.length-1; i>0; i--) {
                const randomIndex = Math.floor(Math.random()*(i-1));
                const tmp = topicJudges[randomIndex];
                topicJudges[randomIndex] = topicJudges[i];
                topicJudges[i] = tmp;
            }


            Promise.all(get(this.players).map(async (player, index) => {
                topics.push({
                    uuid: getRandomUUID(),
                    about: player.networkId,
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

        this.networkManager.addEventListener("leave", (event : CustomEventInit<NetworkID>) => {
            this.playerLeft(event.detail!);
        });

        this.networkManager.addEventListener("invalid", (event : CustomEventInit<string>) => {
            this.recieveInvalid(event.detail!);
        })

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

        this.networkManager.addEventListener("guess", (event : CustomEventInit<NetworkID>) => {
            this.recieveGuess(event.detail!);
        })

        this.networkManager.addEventListener("continue", () => {
            this.recieveContinue();
        })
    }

    sendMessages(messages : Message[]) {
        this.recieveMessages(messages);
        this.networkManager.sendMessages!(messages);
    }

    sendGuess(guessedPlayerId : NetworkID) {
        this.recieveGuess(guessedPlayerId);
        this.networkManager.sendGuess!(guessedPlayerId);
    }

    sendJudging(topicId : UUID) {
        this.recieveJudging(topicId);
        this.networkManager.sendJudging!(topicId);
    }

    sendContinue() {
        console.log("IM TRYING TO SEND CONTINUE")
        if (this.hosting) {
            this.recieveContinue();
            this.networkManager.sendContinue!(null);
        }
    }
    //#region Network Events

    tryStartJudging() {
        if (!this.hosting) return;

        const submittedPlayers = get(this.submittedPlayers);
        
        let anyoneNotSubmitted = false;
        
        get(this.players).forEach(player => {
            anyoneNotSubmitted = anyoneNotSubmitted || !submittedPlayers.has(player.networkId);
        })

        if (!anyoneNotSubmitted) {
            this.sendJudging(this.topics[0].uuid)
        }
    }

    playerJoined() {
        if (this.hosting) {
            console.log("Someone joined, I'm leaving the NetworkManager to take care of that");
        }
    }

    playerLeft(disconnectedPlayer : NetworkID) {
        this.players.update((players) => {
            return players.filter(player => player.networkId !== disconnectedPlayer);
        });
        this.dispatchEvent(new CustomEvent("leave", {detail: disconnectedPlayer}))
        // NOTE: This makes it so that if a player submits some messages then leaves, the game will start judging prematurely
        this.tryStartJudging();
    }

    recieveInvalid(reason : string) {
        console.error(`Server issued invalid. Reason: ${reason}`);
        this.dispatchEvent(new Event("invalid"));
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
        this.messages = [];
        for (const player of get(this.players)) {
            player.score = 0;
        }
        goto("/game");
    }

    recieveMessages(messages : Message[]) {
        console.log("Recieved Messages!");
        this.messages = this.messages.concat(messages);
        this.submittedPlayers.update(players => {
            return players.add(<NetworkID>messages[0].author);
        })
        this.tryStartJudging();
    }

    recieveJudging(topicId : UUID) {
        console.log("Passing on the judging " + topicId);
        this.dispatchEvent(new CustomEvent("judging", {detail: <UUID>topicId}));
    }

    recieveGuess(guessedPlayerId : NetworkID) {
        console.log("Passing on the guess " + guessedPlayerId);
        this.dispatchEvent(new CustomEvent("guess", {detail: guessedPlayerId}));
    }

    recieveContinue() {
        console.log("Recieved continue in GM");
        this.dispatchEvent(new Event("continue"));
    }

    //#endregion
}
