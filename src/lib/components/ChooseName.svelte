<script lang="ts">
    import { browser } from "$app/environment";

    export let name = browser ? localStorage.getItem("name") : undefined;

    let _name = name ?? "";
    let remember = false;
</script>


<div class="name">
    <section>
        <div class="together">
            <h1 class="title">Choose Your Name</h1>
            <p>Make sure to choose a name that people you're playing with will recognize as <u>you</u>!</p>
        </div>
        <br>
        <input bind:value={_name} class="nameInput" type="text" name="Name Input" placeholder="Enter your name">
        <div class="saveName">
            <input bind:value={remember} type="checkbox" name="" id="save-name-box">
            <label for="save-name-box">Remember my name</label>
        </div>
        <button class="save" on:click={() => {name = _name; if (remember) {localStorage.setItem("name", name)}}}>Save</button>
    </section>
</div>


<style>
    .name {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 10;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .name > section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        /* gap: 3vh; */
        width: 90%;
        height: 90%;
        border-radius: 24px;
        background: lightgray;
        border: 3px solid black;
    }

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
    }

    .nameInput:placeholder-shown {
        border: 3px dashed rgba(0, 0, 0, 0.5);
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