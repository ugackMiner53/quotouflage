<script lang="ts">
    import { browser } from "$app/environment";
    import Popup from "./Popup.svelte";

    export let name;

    let _name = browser ? localStorage.getItem("name") ?? "" : "";
    let remember = false;
</script>


<Popup>
    <div class="together">
        <h1 class="title">Choose Your Name</h1>
        <p>Make sure to choose a name that people you're playing with will recognize as <u>you</u>!</p>
    </div>
    <br>
    <input bind:value={_name} class="nameInput" type="text" name="Name Input" placeholder="Enter Your Name">
    <div class="saveName">
        <input bind:value={remember} type="checkbox" name="" id="save-name-box">
        <label for="save-name-box">Remember my name</label>
    </div>
    <button class="save" on:click={() => {name = _name.toUpperCase(); if (remember) {localStorage.setItem("name", _name)}}}>Save</button>
</Popup>


<style>
    p {
        margin: 3vw;
        text-align: center;
    }

    .nameInput {
        width: 40vw;
        height: 7vh;
        min-height: fit-content;
        background: none;
        border-color: transparent;
        border-bottom: 3px solid black;
        font-size: 3vw;
        font-weight: bold;
        transition: 0.5s;
        text-transform: uppercase;
    }

    .nameInput:placeholder-shown {
        border: 3px dashed rgba(0, 0, 0, 0.5);
        text-transform: none;
    }

    .saveName {
        font-size: 2vw;
    }

    .saveName > input[type=checkbox] {
        width: 2vw;
        height: 2vw;
        cursor: pointer;
    }

    .together {
        display: inherit;
        flex-direction: inherit;
        align-items: inherit;
    }

    .title {
        font-size: 5vw;
    }

    .save {
        width: 30vw;
        height: 10vh;
        font-size: 3vw;
        transition: 0.3s;
        border: 3px solid black;
        border-radius: 12px;
        cursor: pointer;
    }

    
</style>