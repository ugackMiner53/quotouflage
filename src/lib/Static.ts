import type GameManager from "./GameManager";

export let gameManager : GameManager;

export function setManager(manager : GameManager) {
    gameManager = manager;
}