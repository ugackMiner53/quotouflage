<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { PUBLIC_PIN_LENGTH } from "$env/static/public";
    import { gameManager, createNewGameManager } from "$lib/Static";
    import type { UUID } from "$lib/Types";
    import { getRandomEmoji } from "$lib/Utility";
    import ChooseName from "$lib/components/ChooseName.svelte";
    import Connecting from "$lib/components/Connecting.svelte";
    import { get, writable, type Writable } from "svelte/store";
    import { fade } from "svelte/transition";

    const PIN_LENGTH = parseInt(PUBLIC_PIN_LENGTH)

    let name : Writable<string|undefined> = writable(browser ? localStorage.getItem("name") ?? undefined : undefined);
    let pinInputs : HTMLInputElement[] = [];
    let pinCode : string[] = [];

    // Room connection status
    let connecting = writable(false);
    let connectedPeers = writable(0);

    let abortConnectionController : AbortController;

    function onPinClick() {
        if (pinCode.length < 0 || pinCode.length >= PIN_LENGTH) return;

        pinInputs[pinCode.length].focus();
    }

    function handlePinInput(event : Event, elem : number) {
        const target = event.target as HTMLInputElement;

        if (target.value == "") {
            pinCode.splice(-1)
            if (pinCode.length > 0) pinInputs[pinCode.length-1].select();
        } else {
            pinCode[elem] = target.value;
            onPinClick();
        }
        
        if (pinCode.length == PIN_LENGTH) {
            joinGame()
        }
    }

    function handlePinBack(inputEvent : KeyboardEvent) {
        if (pinCode.length <= 0) return;

        if (inputEvent.key === "Backspace" && (<HTMLInputElement>inputEvent.target).value == "") {
            inputEvent.preventDefault();
            pinInputs[pinCode.length-1].select();
        }
    }

    async function joinGame() {
        const $name = get(name);
        if (!$name) return;

        updateManager($name);
        $connecting = true;
        abortConnectionController = new AbortController();
        gameManager.joinGame(pinCode.join("").toUpperCase(), abortConnectionController.signal).then(() => {
            console.log(`Joined ${pinCode.join("").toUpperCase()} correctly`)
            goto("/lobby");    
            $connecting = false;
        }).catch(() => {
            console.log(`Did not join ${pinCode.join("").toUpperCase()} correctly`)
            // TODO: Consider showing an error message here at some point
            $connecting = false;
        })
    }

    function createGame() {
        const $name = get(name);
        if (!$name) return;

        updateManager($name);
        gameManager.createGame();
        goto("/lobby")
    }

    function updateManager(name : string) {
        if (!gameManager) {
            createNewGameManager(name);
        } else {
            gameManager.updateSelf({
                uuid: <UUID>crypto.randomUUID(),
                name,
                emoji: getRandomEmoji(),
                score: 0
            })
        }
    }

</script>

{#if $name == undefined}
    <ChooseName bind:name={$name} />
{/if}

{#if $connecting}
    <!-- TODO: Actually give this the correct number of connected peers :/ -->
    <Connecting 
        on:cancel={() => {
            pinCode = []
            pinInputs.forEach(input => {
                input.value = "";
            })
            abortConnectionController.abort();
            $connecting = false;
        }} 
        connectedPeers={$connectedPeers} 
        gameCode={pinCode.join("").toUpperCase()} 
    />
{/if}

<button class="name" on:click={() => {$name = undefined}}>
    <p>{$name}</p>
</button>

<div class="main" in:fade={{delay: 300}} >

    <section out:fade={{delay:0, duration: 300}}>
        <h1 class="title">Join Game</h1>
        <button class="pin-input" on:focus={onPinClick}>
            {#each {length: PIN_LENGTH} as _, i}
                <input bind:this={pinInputs[i]} on:input={(e) => {handlePinInput(e, i)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            {/each}
            <!-- <button>GO</button> -->
        </button>
    </section>
    
    <section out:fade={{delay:0, duration: 300}}>
        <button class="title create" on:click={createGame}>Create Game</button>
    </section>

</div>


<style>
    .name {
        position: fixed;
        top: 1vh;
        right: 1vw;
        width: 15vw;
        height: fit-content;
        min-height: 10vw;
        background: none;
        z-index: 1;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        cursor: pointer;
        transition: 0.3s;
    }

    .name:hover {
        border: 3px solid black;
        background-color: lightgray;
    }

    .name > p {
        font-size: 3vw;
        margin: 0;
    }

    .main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .title {
        font-size: 7vw;
    }

    .pin-input {
        display: flex;
        flex-direction: row;
        gap: 20px;
        cursor: text;
        border: none;
        background: none;
        z-index: 5;
    }

    .pin-input > input {
        width: 3vw;
        font-size: 3vw;
        border: none;
        border-bottom: 3px solid black;
        z-index: -1;
        text-transform: uppercase;
    }

    .create {
        border: none;
        border-bottom: 3px solid transparent;
        background: none;
        cursor: pointer;
        transition: 0.3s;
    }

    .create:hover {
        border-color: black;
    }
</style>