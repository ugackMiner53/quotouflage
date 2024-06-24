import GameManager from "./GameManager";

export let gameManager : GameManager;

export function createNewGameManager(name : string) {
    gameManager = new GameManager(name);
}