<script lang="ts">
    import ChooseName from "$lib/components/ChooseName.svelte";
    import { fade } from "svelte/transition";

    let name : string|undefined;
    let pinInputs : HTMLInputElement[] = [];
    let pinCode : string[] = [];


    function onPinClick() {
        if (pinCode.length < 0 || pinCode.length >= 6) return;

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

        
        if (pinCode.length == 6) {
            // Try to join
        }
    }

    function handlePinBack(inputEvent : KeyboardEvent) {
        if (pinCode.length <= 0) return;

        if (inputEvent.key === "Backspace" && (<HTMLInputElement>inputEvent.target).value == "") {
            inputEvent.preventDefault();
            pinInputs[pinCode.length-1].select();
        }
    }



</script>

{#if name == undefined}
    <ChooseName bind:name={name} />
{/if}

<!-- <div class="name">
    This is where the edit button that reopens the name chooser goes
</div> -->

<div class="main" in:fade={{delay: 300}} >

    <section out:fade={{delay:0, duration: 300}}>
        <h1 class="title">Join Game</h1>
        <button class="pin-input" on:focus={onPinClick}>
            <input bind:this={pinInputs[0]} on:input={(e) => {handlePinInput(e, 0)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <input bind:this={pinInputs[1]} on:input={(e) => {handlePinInput(e, 1)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <input bind:this={pinInputs[2]} on:input={(e) => {handlePinInput(e, 2)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <input bind:this={pinInputs[3]} on:input={(e) => {handlePinInput(e, 3)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <input bind:this={pinInputs[4]} on:input={(e) => {handlePinInput(e, 4)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <input bind:this={pinInputs[5]} on:input={(e) => {handlePinInput(e, 5)}} on:keydown={handlePinBack} type="text" maxlength="1" tabindex="-1">
            <!-- <button>GO</button> -->
        </button>
    </section>
    
    <section out:fade={{delay:0, duration: 300}}>
        <button class="title create">Create Game</button>
    </section>

</div>


<style>
    .main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        position: fixed;
        /* z-index: 1; */
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