<script lang="ts">
    import { gameManager } from "$lib/Static";
    import { createEventDispatcher } from "svelte";

    const players = gameManager.players;

    export let finalRound : boolean = false;

    $players = $players.sort((a, b) => {return b.score - a.score})

    const dispatch = createEventDispatcher();
</script>


<div class="holder">
    <h1 class="title">{finalRound ? "Final Scores" : "Scorecard"}</h1>
    
    <div class="scores">
        <b class="name">Name</b>
        <b class="score">Score</b>
        {#each $players as player}
            <p class="name">{player.emoji} {player.name}</p>
            <p class="score">{player.score}</p>
        {/each}
    </div>
    
    {#if gameManager.hosting}
        <button on:click={() => {dispatch("continue")}} class="continue">{finalRound ? "End Game" : "Continue"}</button>
    {/if}


</div>


<style>
    .title {
        font-size: 10vmin;
        margin: 0;
        margin-top: 3vh;
    }

    .holder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10vh;
    }

    
    .scores {
        display: grid;
        grid-template-columns: 1fr 0.5fr;
        gap: 3vh;
        border: 3px solid black;
        overflow-y: scroll;
        padding-top: 3vh;
        width: 70vw;
        height: 70vh;
        text-align: center;
    }

    .continue {
        margin-bottom: 3vh;
        font-size: 5vw;
        background: none;
        border: 3px dashed black;
        padding: 2vw;
        cursor: pointer;
        transition: 0.3s;
        border-radius: 12px;
    }

    .continue:hover {
        border: 3px solid black;
        background: lightgray;
    }
</style>