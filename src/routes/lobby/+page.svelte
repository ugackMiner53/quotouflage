<script lang="ts">
    import { goto } from "$app/navigation";
    import type GameManager from "$lib/GameManager";
    import { createNewGameManager, gameManager } from "$lib/Static";
    import type { Player, UUID } from "$lib/Types";
    import { getRandomEmoji } from "$lib/Utility";
    import type { Writable } from "svelte/store";


    if (!gameManager) {
        createNewGameManager("LIA");
        createFakeManager();
        // goto("/join");
    }

    const players : Writable<Player[]> = gameManager.players;


    function createFakeManager() {
        gameManager.self.emoji = "👑"
        gameManager.gameCode = "7XMNPQ";
        for (let i=0; i<20; i++) {
            const fakePlayer = {
                name: Math.random().toString(36).substr(2, Math.floor(Math.random()*15)).toUpperCase(),
                emoji: getRandomEmoji(),
                uuid: <UUID>crypto.randomUUID()
            }
            gameManager.players.update(newPlayers => {
                newPlayers.push(fakePlayer);
                return newPlayers;
            })
        }
    }
</script>

<h1 class="gamecode">{gameManager.gameCode}</h1>
{#if gameManager.hosting}
    <button class="start">GO!</button>
{/if}

<section>
    <h2 class="player-title">Players</h2>
    
    <div class="players">
        {#each $players as player}
            <div class="player">
                <p class="emoji">{player.emoji}</p>
                <p class="name">{player.name}</p>
            </div>
        {/each}
    </div>
</section>

<button on:click={() => {
    gameManager.recievePlayers([{
        name: "Bibbity bob",
        emoji: getRandomEmoji(),
        uuid: crypto.randomUUID()
    }], false)
}}>CLICK ME</button>

<style>
    .gamecode {
        font-size: 5vw;
        margin-left: 3vw;
    }

    .start {
        top: 0;
        right: 0;
        margin: 2vw;
        font-size: 5vw;
        background: none;
        border: 3px dashed black;
        padding: 2vw;
        position: absolute;
        cursor: pointer;
        transition: 0.3s;
        border-radius: 12px;
    }

    .start:hover {
        border: 3px solid black;
        background: lightgray;
    }

    .player-title {
        font-size: 3vw;
        text-align: center;
    }

    .players {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 3vw;
    }

    .player {
        border: 3px double black;
        padding: 3vw;
        /* width: 3vw; */
        /* min-width: 3vw; */
        text-align: center;
        cursor: default;
    }

    .emoji {
        font-size: 5vw;
        margin: 0;
    }

    .name {
        font-size: 2vw;
        margin: 0;
        font-weight: bold;
    }

</style>