import { type UUID, type Player, type Topic, type Message } from "$lib/Types";

export default interface NetworkManager {
    createNewRoom() : string;
    connectToRoom(roomPIN : string) : void;
    
    //#region Gameplay Methods

    // Send all connected players from server to clients (or one player from client to server)
    sendPlayers(players : Player[]) : void;
    sendTopics(topics : Topic[]) : void;
    sendMessages(messages : Message[]) : void;
    sendJudging(topicId : UUID) : void;
    sendGuess(message : UUID) : void;
    sendContinue() : void;
    //#endregion Gameplay Methods
}