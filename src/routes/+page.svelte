<script>
    import { fade, scale } from "svelte/transition";
    import { goto } from "$app/navigation";
    import About from "$lib/components/About.svelte";
    import { base } from "$app/paths";

    let showAbout = false;

</script>

{#if showAbout}    
    <About on:close={() => {showAbout = false}} />
{/if}

<h1 class="title" in:scale={{delay: 300, start: 100}} out:scale={{duration: 300, start: 5}}>Quotouflage</h1>

<section class="buttons" in:scale={{delay: 300}} out:scale={{duration: 300}}>
    <button on:click={() => goto(`${base}/join`)}>Play</button>
    <button on:click={() => {showAbout = true;}}>About</button>
</section>

<footer transition:fade={{duration: 300}}>
    <a class="source" href="https://github.com/ugackMiner53/quotouflage">Source Code</a>
    <a class="privacy" href="{base}/privacy">Privacy</a>
</footer>


<style>
    .title {
        display: flex;
        justify-content: center;
        font-size: 10vw;
        background: linear-gradient(to bottom right, black, transparent);
        background-clip: text;
        color: transparent;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 3vh;
    }

    .buttons > button {
        width: 40vw;
        height: 15vh;
        background: none;
        border-radius: 12px;
        border: dotted 3px black;
        font-size: 2.5vw;
        opacity: 0.5;
        cursor: pointer;
        transition: 0.3s;
    }

    .buttons > button:hover {
        background: white;
        border: solid 3px black;
        opacity: 1.0;
        font-size: 5vw;
    }

    footer {
        position: fixed;
        left: 0;
        bottom: 0;
        height: 5vh;
        width: 100%;
    }

    footer > .source {
        position: absolute;
        left: 7vw;
    }

    footer > .privacy {
        position: absolute;
        right: 7vw;
    }
</style>