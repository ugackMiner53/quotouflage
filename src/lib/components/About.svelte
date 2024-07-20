<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Popup from "./Popup.svelte";

    const dispatch = createEventDispatcher()
</script>

<Popup >
    <h1>About</h1>

    <p>Quotouflage is a game about blending in with your friends. When you start playing, you'll be given prompts to either write a sentence (as yourself) or imitate what one of the other players would say for that prompt. Your goal is to convince the judge of each round that you are the player you're imitating. If the judge picks you, you get a point! If you're judging and you pick correctly, you also get a point! But if the judge picks wrong, the imposter gets a point!</p>
    <p>Can you act more like your friends than they can? Can you tell the fakes from the genuine? Hop into a game and find out!</p>
    <button class="close" on:click={() => {dispatch("close")}}>Close</button>
</Popup>

<style>
    h1 {
        font-size: 5vmax;
    }

    p {
        max-width: 80vw;
        text-align: center;
    }

    .close {
        width: 20vw;
        height: 5vh;
        cursor: pointer;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        transition: 0.3s;
    }

    .close:hover {
        border: 3px solid black;
    }
</style>