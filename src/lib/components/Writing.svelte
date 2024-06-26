<script lang="ts">
    import type { Player } from "$lib/Types";
    import { createEventDispatcher } from "svelte";

    export let topic : string;

    export let about : Player|undefined;
    export let exampleMessage : string|undefined;

    let answer = "";

    const dispatch = createEventDispatcher()
</script>


<div class="prompt">
    {#if about}
        <h1>Write a sentence that <span style="white-space: nowrap;">{about.emoji} {about.name}</span> would write about {topic}</h1>
    {:else if exampleMessage}
        <h1>Write a sentence about {topic} similar to</h1>
        <h2>"{exampleMessage}"</h2>
    {:else}
        <h1>Write a sentence about {topic}</h1>
    {/if}
</div>

<form class="answer" on:submit={(event) => {
    event.preventDefault(); 
    dispatch("submit", answer);
    answer = "";
}}>
    <input type="text" name="answer" id="answer" autocomplete="off" bind:value={answer}>
    <button class="submit" type="submit">Submit</button>
</form>

<style>
    .prompt {
        text-align: center;
        font-size: 2vmax;
    }

    .answer {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 2vh;
        margin-top: 30vh;
    }

    #answer {
        width: 70vw;
        border: none;
        font-size: 3vmin;
        border-bottom: 3px solid black;
    }

    .submit {
        margin: 2vw;
        font-size: 5vw;
        background: none;
        border: 3px dashed black;
        padding: 2vw;
        cursor: pointer;
        transition: 0.3s;
        border-radius: 12px;
    }

    .submit:hover {
        border: 3px solid black;
        background: lightgray;
    }
</style>