<script lang="ts">
    import { goto } from "$app/navigation";
    import { gameManager } from "$lib/Static";
    import type { Player } from "$lib/Types";
    import type { Writable } from "svelte/store";

    if (!gameManager) {
        goto("/join");
    }

    const players : Writable<Player[]> = gameManager.players;
</script>

<h1 class="gamecode">{gameManager.gameCode}</h1>
{#if gameManager.hosting}
    <button disabled={$players.length < 3} class="start" on:click={gameManager.startGame.bind(gameManager)}>GO!</button>
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

    .start:disabled {
        cursor: not-allowed;
        border: 3px dashed lightgray;
    }

    .start:hover:not(:disabled) {
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