<script lang="ts">
    import { gameManager } from "$lib/Static";
    import type { Topic, Message, UUID } from "$lib/Types";

    export let topic : Topic;

    const judge = gameManager.uuidToPlayer(topic.judge);
    const about = gameManager.uuidToPlayer(topic.about);

    function getMessagesAboutTopic() : Message[] {
        return gameManager.messages.filter(message => {
            return message.topic === topic.uuid;
        })
    }

    function isJudging() : boolean {
        return topic.judge === gameManager.self.uuid;
    }

    function guess(guessedPlayerId : UUID) {
        console.log("YOU GUESSED " + guessedPlayerId === topic.about)
        gameManager.sendJudgement(guessedPlayerId);
    }
</script>

<div class="holder">
    <div class="prompt">
        {#if topic.judge === gameManager.self.uuid}
            <h1>Find which sentence was written by {`${about?.emoji} ${about?.name}`} about {topic.topic}</h1>
        {:else}
            <h1>{`${judge?.emoji} ${judge?.name}`} is looking for {`${about?.emoji} ${about?.name}`}</h1>
        {/if}
    </div>
    
    <div class="guessbox">
        {#each getMessagesAboutTopic() as message}
            <button on:click={() => {guess(message.author)}} disabled={!isJudging()} class="guess">{isJudging() ? "" : gameManager.uuidToPlayer(message.author)?.emoji ?? ""} {message.message}</button>
        {/each}
    </div>
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

    .guess {
        width: 85%;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        padding: 1vmax;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        transition: 0.3s;
    }

    .guess:hover {
        border: 3px solid black;
        background: lightgray;
    }

    .guess:disabled {
        border: 3px dashed rgba(0, 0, 0, 0.5);
        background: lightgray;
        cursor: default;
    }
</style>