<script lang="ts">
    import { gameManager } from "$lib/Static";
    import type { Topic, Message, NetworkID } from "$lib/Types";
    import { createEventDispatcher } from "svelte";

    
    export let topic : Topic;
    export let guessedPlayer : NetworkID|null = null;

    const judge = gameManager.networkIdToPlayer(topic.judge);
    const about = gameManager.networkIdToPlayer(topic.about);

    const dispatch = createEventDispatcher();

    function getMessagesAboutTopic() : Message[] {
        return gameManager.messages.filter(message => {
            return message.topic === topic.uuid;
        })
    }

    function isJudging() : boolean {
        return topic.judge === gameManager.self.networkId;
    }

    function guess(guessedPlayerId : NetworkID) {
        console.log("YOU GUESSED " + (guessedPlayerId === topic.about))
        gameManager.sendGuess(guessedPlayerId);
    }
</script>

<div class="holder">
    <div class="prompt">
        {#if topic.judge === gameManager.self.networkId}
            <h1>Find which sentence was written by {`${about?.emoji} ${about?.name}`} about {topic.topic}</h1>
        {:else}
            <h1>{`${judge?.emoji} ${judge?.name}`} is looking for {`${about?.emoji} ${about?.name}`} writing about {topic.topic}</h1>
        {/if}
    </div>
    
    <div class="guessbox">
        {#each getMessagesAboutTopic() as message}
            <button 
                on:click={() => {guess(message.author);}} 
                disabled={!isJudging() || guessedPlayer != null} 
                class={`option ${guessedPlayer == message.author ? "guess" : ""} ${guessedPlayer != null && (message.author == topic.about) ? "about" : ""}`}
            >
                    {(isJudging() && !guessedPlayer) ? "" : gameManager.networkIdToPlayer(message.author)?.emoji ?? ""} {message.message}
            </button>
        {/each}
    </div>

    {#if gameManager.hosting && guessedPlayer}
        <button on:click={() => {dispatch("continue")}} class="continue">Continue</button>
    {/if}

</div>

<style>
    .prompt {
        text-align: center;
        font-size: 2vmax;
    }

    .holder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10vh;
    }

    .guessbox {
        border: 3px solid black;
        width: 70vw;
        height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: scroll;
        border-radius: 12px;
        gap: 1vh;
        padding: 1vh;
        margin-bottom: 3vh;
    }

    .option {
        width: 85%;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        padding: 1vmax;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        transition: 0.3s;
    }

    .option:hover {
        border: 3px solid black;
        background: lightgray;
    }

    .option:disabled {
        border: 3px dashed rgba(0, 0, 0, 0.5);
        background: lightgray;
        cursor: default;
    }

    .option.about {
        border: 3px solid lime;
    }

    .option.guess:not(.about) {
        border: 3px solid red;
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