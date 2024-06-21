import { type UUID, type Player, type Topic, type Message } from "$lib/Types";

export default interface NetworkManager {
    createNewRoom() : string;
    connectToRoom(roomPIN : string) : void;
    
    //#region Gameplay Methods

    // // Send all connected players from server to clients (or one player from client to server)
    // sendPlayers(players : Player[]) : void;
    // // Recieve all connected players from server (or one player from client)
    // recievePlayers(players : Player[]) : void|undefined;
    // // Send all topics from server to clients
    // sendTopics(topics : Topic[]) : void;
    // // Recieve all topics from server
    // recieveTopics(topics : Topic[]) : void|undefined;
    // // Send all messages answered from client to peers
    // sendMessages(messages : Message[]) : void;
    // // Recieve all messages from peer
    // recieveMessages(messages : Message[]) : void|undefined;
    // // Send current topic being judged from server to clients
    // sendJudging(topic : Topic) : void;
    // // Recieve current topic being judged from server
    // recievedJudging(topic : Topic) : void;
    // // Send guess for correct message from client to peers
    // sendJudgement(message : UUID) : void;
    // // Recieve guess for message from client
    // recieveJudgement(message : UUID) : void;

    //#endregion Gameplay Methods
}